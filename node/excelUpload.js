import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import createConnection from './db.js';
import moment from 'moment/moment.js';

const router = express.Router();
const upload = multer({ dest: "uploads/" });
const storePool = createConnection('store_system');

router.post("/upload", upload.single("file"), async (req, res) => {
    const dateTime_input = moment().format('YYYY-MM-DD HH:mm:ss');
    const dateInput = moment().format('YYYY-MM-DD');
    // const dateTime_input = '2025-03-09 10:00:00';

    if (!req.file) {
        return res.status(400).json({ error: "กรุณาเลือกไฟล์ Excel" });
    }

    const trimValue = (value) => (value && typeof value === 'string' ? value.trim() : value);

    const stock_id = trimValue(req.body.selectedStock);
    const idcard_input = trimValue(req.body.idcard);
    let remark = trimValue(req.body.remark) || null;
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const connection = await storePool.getConnection();
    await connection.beginTransaction();

    try {
        for (const row of data) {
            const productId = trimValue(row["รหัสสินค้า"]);
            const productUnit = trimValue(row["หน่วยนับ"]);
            const productRemain = trimValue(row["ปริมาณ คงเหลือ"]);
            const productGroup = trimValue(row["กลุ่มสินค้า"]);
            const productDetail = trimValue(row["รายละเอียด"]);
            const productPrice = trimValue(row["ราคาเฉลี่ย"]);
            const productInput = trimValue(row["ปริมาณ รับเข้า"]);

            try {
                // ✅ ตรวจสอบ pu_id จากชื่อหน่วยนับ
                let [unitRows] = await connection.execute(
                    `SELECT pu_id FROM product_unit WHERE pu_name = ?`,
                    [productUnit]
                );

                let pu_id;
                if (unitRows.length > 0) {
                    pu_id = unitRows[0].pu_id;
                } else {
                    let [lastPu] = await connection.execute(
                        `SELECT pu_id FROM product_unit WHERE pu_id LIKE 'PU%' ORDER BY pu_id DESC LIMIT 1`
                    );

                    let newPuNumber = lastPu.length > 0 ? parseInt(lastPu[0].pu_id.replace("PU", ""), 10) + 1 : 1;
                    pu_id = `PU${newPuNumber}`;

                    await connection.execute(
                        `INSERT INTO product_unit (pu_id, pu_name, pu_status) VALUES (?, ?, ?)`,

                        [pu_id, productUnit, 'open']
                    );
                }

                // ✅ เช็กว่า product_id มีอยู่ใน product_list หรือไม่
                let [existingProduct] = await connection.execute(
                    `SELECT product_id FROM product_list WHERE product_id = ?`,
                    [productId]
                );

                if (existingProduct.length > 0) {
                    let [currentProduct] = await connection.execute(
                        `SELECT product_remain, product_select_mn FROM product_list WHERE product_id = ?`,
                        [productId]
                    );

                    if (currentProduct.length > 0) {
                        const currentRemain = parseFloat(currentProduct[0].product_remain) || 0;
                        const currentSelectMn = parseFloat(currentProduct[0].product_select_mn) || 0;
                        const inputAmount = parseFloat(productInput) || 0;

                        const updatedRemain = currentRemain + inputAmount;
                        const updatedSelectMn = currentSelectMn + inputAmount;

                        await connection.execute(
                            `UPDATE product_list 
                             SET product_received = ?, product_remain = ?, product_select_mn = ?, product_date = ?, product_price = ?, idcard_input = ?
                             WHERE product_id = ?`,
                            [productInput, updatedRemain, updatedSelectMn, dateInput, productPrice, idcard_input, productId]
                        );
                    }

                } else {
                    // ✅ เพิ่มสินค้าใหม่
                    await connection.execute(
                        `INSERT INTO product_list (
                            product_id, stock_id, pg_id, product_detail, pu_id, 
                            product_received, product_remain, product_select_mn,
                            product_date, product_price, idcard_input, status_usage
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            productId,
                            stock_id,
                            productGroup,
                            productDetail,
                            pu_id,
                            productInput,
                            productRemain,
                            productRemain,
                            dateInput,
                            productPrice,
                            idcard_input,
                            'open'
                        ]
                    );
                }

                // ✅ บันทึกข้อมูลลง product_insert
                await connection.execute(
                    `INSERT INTO product_insert (
                        product_id, pg_id, product_detail, pu_id, 
                        product_received, product_remain, idcard_input, 
                        product_price, stock_id, dateTime_input, remark
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        productId,
                        productGroup,
                        productDetail,
                        pu_id,
                        productInput,       // ปริมาณ รับเข้า
                        productRemain,      // ปริมาณ คงเหลือ
                        idcard_input,
                        productPrice,
                        stock_id,
                        dateTime_input,
                        remark
                    ]
                );

            } catch (dbError) {
                console.error("Error processing row:", dbError);
            }
        }

        await connection.commit();
        res.json({ message: "Import Success!" });

    } catch (error) {
        await connection.rollback();
        console.error("Transaction error:", error);
        res.status(500).json({ error: "Error processing file" });

    } finally {
        connection.release();
        fs.unlinkSync(filePath); // ลบไฟล์หลังอัปโหลดเสร็จ
    }
});

router.post('/get-product-import', async (req, res) => {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT pi.idcard_input, pi.stock_id,
                CONCAT(TRIM(de.name), ' ', TRIM(de.lastname)) AS full_name,
                DATE_FORMAT(pi.dateTime_input, '%d-%m-%Y') AS date_input
            FROM product_insert pi
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pi.idcard_input
            WHERE pi.stock_id = 'A' 
                GROUP BY pi.dateTime_input, pi.idcard_input 
                ORDER BY pi.dateTime_input DESC
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/delete-product-import', async (req, res) => {
    const { date_input, idcard_input, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        let [existingProduct] = await conn.query(`
            SELECT product_id, product_received, product_remain 
            FROM product_insert 
            WHERE DATE_FORMAT(dateTime_input, '%d-%m-%Y') = ? AND idcard_input = ?;
        `, [date_input, idcard_input]);

        if (existingProduct.length > 0) {
            for (const product of existingProduct) {
                const currentProductId = product.product_id;
                const currentVolume = parseFloat(product.product_received) || 0;
                // const currentRemain = parseFloat(product.product_remain) || 0;

                await conn.query(`
                    UPDATE product_list 
                    SET product_remain = GREATEST(product_remain - ?, 0), 
                        product_select_mn = GREATEST(product_select_mn - ?, 0)
                    WHERE product_id = ?;
                `, [currentVolume, currentVolume, currentProductId]);
            }
        }

        await conn.query(`
            DELETE FROM product_insert
            WHERE DATE_FORMAT(dateTime_input, '%d-%m-%Y') = ? AND idcard_input = ?;
        `, [date_input, idcard_input]);

        const Detail = `สโตร์ลบสินค้ารายการรับเข้าประจำวันที่ ${date_input}`;
        await conn.query(`
            INSERT INTO log_stock (idcard_input, remarks, stock_id, dateTime_input) 
            VALUES (?, ?, ?, ?);
        `, [idcard, Detail, stock_id, dateTime_input]);

        await conn.commit();
        res.status(200).json({ success: true, message: 'ลบข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-product-detail', async (req, res) => {
    const { date_input } = req.body;
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pi.id, pi.product_id, pi.pg_id, pi.product_detail, pi.pu_id, 
                pu.pu_name, pi.product_received, pl.product_remain, 
                pi.product_price, pi.idcard_input, pi.stock_id,
                DATE_FORMAT(pi.dateTime_input, '%d-%m-%Y') AS date_input
            FROM product_insert pi
            LEFT JOIN product_unit pu ON pu.pu_id = pi.pu_id
            LEFT JOIN product_list pl ON pl.product_id = pi.product_id
            WHERE pi.stock_id = ? 
            AND DATE_FORMAT(pi.dateTime_input, '%d-%m-%Y') = ?;
        `, ['A', date_input]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/delete-product', async (req, res) => {
    const { id, product_id, product_received, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE product_list 
            SET product_remain = GREATEST(product_remain - ?, 0), 
                product_select_mn = GREATEST(product_select_mn - ?, 0)
            WHERE product_id = ?;
        `, [product_received, product_received, product_id]);

        await conn.query(`
            DELETE FROM product_insert
            WHERE id = ?;
        `, [id]);

        const Detail = `สโตร์ลบปริมาณรับเข้าสินค้า ${product_id}`;
        await conn.query(`
            INSERT INTO log_stock (product_id, idcard_input, remarks, stock_id, dateTime_input) 
            VALUES (?, ?, ?, ?, ?);
        `, [product_id, idcard, Detail, stock_id, dateTime_input]);

        await conn.commit();
        res.status(200).json({ success: true, message: 'ลบข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/upload-excel', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const connection = await storePool.getConnection();

        let results = [];
        for (const row of data) {
            const [rows] = await connection.execute(
                `SELECT pl.product_id, pl.product_detail, pl.product_remain, pu.pu_name
                FROM product_list pl
                LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
                WHERE pl.product_id = ?`, [row['รหัสสินค้า']]
            );

            if (rows.length > 0) {
                const dbProduct = rows[0];

                const dbProductRemain = parseFloat(dbProduct.product_remain);
                const excelProductRemain = parseFloat(row['ปริมาณ คงเหลือ']);

                const isMismatch = dbProductRemain !== excelProductRemain;

                if (isMismatch) { // เก็บเฉพาะข้อมูลที่ไม่ตรงกัน
                    results.push({
                        product_id: row['รหัสสินค้า'],
                        product_detail: dbProduct.product_detail,
                        product_remain_excel: row['ปริมาณ คงเหลือ'],
                        product_remain_db: dbProduct.product_remain,
                        pu_name: dbProduct.pu_name,
                        status: 'ไม่ตรงกัน'
                    });
                }
            } else {
                // กรณีไม่พบสินค้าจากฐานข้อมูล
                results.push({
                    product_id: row['รหัสสินค้า'],
                    product_detail: 'ไม่มีข้อมูล',
                    product_remain_excel: row['ปริมาณ คงเหลือ'],
                    product_remain_db: 'ไม่มีในระบบ',
                    pu_name: 'ไม่มีในระบบ',
                    status: 'ไม่มีในฐานข้อมูล'
                });
            }
        }

        connection.release();
        res.json({ data: results });

        // ลบไฟล์หลังจากตอบกลับแล้ว
        fs.unlink(req.file.path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });

    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
    }
});

export default router;