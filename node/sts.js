import express from 'express';
import createConnection from './db.js';
import moment from 'moment/moment.js';
import socket from './socket-io.js';
import {
    countStoreApprove,
    countBossAprWithdrawal,
    countBossApprove,
    countBossApproveMn,
    countBossApproveMenu
} from './counts.js';

const router = express.Router();
const maintPool = createConnection('maint_system');
const empGreenPool = createConnection('emp_green');
const storePool = createConnection('store_system');

router.post('/get-depart', async (req, res) => {
    let conn;
    try {
        conn = await empGreenPool.getConnection();
        const [sql] = await conn.query(`
            SELECT name, id_depart FROM depart WHERE st_depart = ?;
        `, ['yes']);

        const transformedData = sql.map(({ name, id_depart }) => ({
            name,
            id_depart: id_depart?.startsWith('131-') ? '131' : id_depart
        }));

        res.status(200).json({ success: true, data: transformedData });
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-typework', async (req, res) => {
    let conn;
    try {
        conn = await maintPool.getConnection();
        const [rows] = await conn.query(`
            SELECT tw_id, name_tw, short_tw, type_req
            FROM type_work WHERE dele_tw = ?
        `, ['open']);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-request', async (req, res) => {
    const { tw_id } = req.body;
    let conn;
    try {
        conn = await maintPool.getConnection();
        const [rows] = await conn.query(`
            SELECT
            rm.request_id,
            CONCAT(rm.request_id,' : ', rm.mc_id, ' : ', md.name_mc, ' : ', rm.detail_problem ) AS request
            FROM request_ms rm
            LEFT JOIN machaine_detail md ON md.mc_id = rm.mc_id
            WHERE rm.tw_id = ? AND rm.request_id IS NOT NULL;
        `, [tw_id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-request-depart', async (req, res) => {
    let conn;
    try {
        conn = await maintPool.getConnection();
        const [rows] = await conn.query(`
            SELECT
            rm.request_id,
            CONCAT(rm.request_id,' : ', rm.mc_id, ' : ', md.name_mc, ' : ', rm.detail_problem ) AS request
            FROM request_ms rm
            LEFT JOIN machaine_detail md ON md.mc_id = rm.mc_id
            WHERE rm.tw_id = ?;
        `, ['TW05']);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-approver', async (req, res) => {
    const { pp_id, idcard_emp } = req.body;
    let conn;
    try {
        conn = await empGreenPool.getConnection();
        let rows;

        if (pp_id === 'PP002') {
            [rows] = await conn.query(`
                SELECT idcard_apr, name_apr
                FROM maint_system.employ_apr
                WHERE idcard_emp = ? AND apr_role = ?
        `, [idcard_emp, 'boss']);
        } else {
            [rows] = await conn.query(`
            SELECT 
                REPLACE(de.idcard, '-', '') AS idcard_apr, 
                CONCAT(TRIM(de.name),' ',TRIM(de.lastname)) AS name_apr, 
                de.p_id, p.pp_id
            FROM data_emp de
                LEFT JOIN positions p ON p.p_id = de.p_id
            WHERE p.pp_id = ?
                AND st_emp IN (?, ?)
        `, [pp_id, 'ผ่านงาน', 'ทดลองงาน']);
        }

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-approver-depart', async (req, res) => {
    const { idcard_emp } = req.body
    let conn;
    try {
        conn = await maintPool.getConnection();
        const [rows] = await conn.query(`
            SELECT * FROM employ_apr WHERE idcard_emp = ? AND apr_role = ?
        `, [idcard_emp, 'boss']);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-sparepart', async (req, res) => {
    const { stock_id } = req.body;
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pl.product_id, 
                pl.product_detail, 
                pl.product_select_mn, 
                pu.pu_name
            FROM product_list pl
            LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
            WHERE stock_id = ? 
            AND product_select_mn <> '0' 
            AND status_usage = 'open';
        `, [stock_id]);

        const formattedData = rows.map(row => ({
            ...row,
            display_text: `${row.product_id}: ${row.product_detail.length > 90
                ? row.product_detail.slice(0, 90) + '...'
                : row.product_detail
                } -- คงเหลือ ${row.product_select_mn} ${row.pu_name}`
        }));

        res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-stock-type', async (req, res) => {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT * FROM stock_type
        `);
        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-withdraw-type', async (req, res) => {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT * FROM withdraw_type WHERE wt_status = 'yes'
        `);
        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/save-user-request', async (req, res) => {
    const { wt_id, depart_use, location_use, remark_req, request_id, products, idcard, idcard_input, status_apr } = req.body;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');
    const date_input = now.format('YYYY-MM-DD');
    const year = now.add(543, 'years').format('YY');
    const month = now.format('MM');
    const sub_date = wt_id + year + month;
    let conn;

    try {
        conn = await storePool.getConnection();
        let statusId = status_apr === 'SA99' ? 'ST06' : 'ST05';
        let logDetail = status_apr === 'SA99' ? 'ขอเบิกสแปร์พาร์ท' : 'ขอเบิกสแปร์พาร์ท รอหัวหน้าอนุมัติ';
        let dateTime_apr = status_apr === 'SA99' ? dateTime_input : null;

        const [[{ lastPWId }]] = await conn.query(`
            SELECT LPAD(IFNULL(MAX(SUBSTRING(pw_id, 7, 4)), 0) + 1, 4, '0') AS lastPWId
            FROM product_withdraw WHERE pw_id LIKE ?;
        `, [`${sub_date}%`]);
        const pw_id = `${sub_date}${lastPWId || '0001'}`;

        for (const product of products) {
            const { stock_id, product_id, quantity } = product;
            const [[existingProduct]] = await conn.query(`
                SELECT product_select_mn FROM product_list WHERE stock_id = ? AND product_id = ?;
            `, [stock_id, product_id]);

            if (!existingProduct) {
                throw new Error(`สินค้า ${product_id} ไม่พบในฐานข้อมูล`);
            }
            if (existingProduct.product_select_mn < quantity) {
                throw new Error(`สินค้า ${product_id} มีคงเหลือไม่เพียงพอ`);
            }
        }

        for (const product of products) {
            const { stock_id, product_id, quantity } = product;

            await conn.query(`
                UPDATE product_list SET 
                    product_date = ?, 
                    product_select_mn = product_select_mn - ?
                WHERE stock_id = ? AND product_id = ?;
            `, [date_input, quantity, stock_id, product_id]);

            await conn.query(`
                INSERT INTO product_withdraw (pw_id, stock_id, product_id, request_qty, status_id, location_use, depart_use, wt_id, request_id, idcard_input, request_qty_date, remark_req)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            `, [pw_id, stock_id, product_id, quantity, statusId, location_use, depart_use, wt_id, request_id, idcard_input, dateTime_input, remark_req]);
        }

        const [result] = await conn.query(`
            INSERT INTO product_approval (status_id, pw_id, idcard_input, dateTime_input, idcard_apr, dateTime_apr, wt_id)
            VALUES (?, ?, ?, ?, ?, ?, ?);
        `, [statusId, pw_id, idcard_input, dateTime_input, idcard || idcard_input, dateTime_apr, wt_id]);

        // const id_prod_appr = result.insertId;

        await conn.query(`
            INSERT INTO log_detail (pw_id, status_id, idcard_input, detail, dateTime_input)
            VALUES (?, ?, ?, ?, ?);
        `, [pw_id, statusId, idcard_input, logDetail, dateTime_input]);

        const countResult = await countBossAprWithdrawal(req);
        console.log('countResult : ', countResult);
        if (countResult.status) {
            socket.sendSumBoss(countResult.bossCount);
        }

        const bossApproveResult = await countBossApprove(req);
        console.log('bossApproveResult : ', bossApproveResult);
        if (bossApproveResult.status) {
            socket.sendSumBossApr(bossApproveResult.bossAprCount);
        }

        const bossApproveMnResult = await countBossApproveMn(req);
        console.log('bossApproveMnResult : ', bossApproveMnResult);
        if (bossApproveMnResult.status) {
            socket.sendSumBossAprMn(bossApproveMnResult.bossAprMnCount);
        }

        res.status(200).json({ success: true, message: 'บันทึกข้อมูลสำเร็จ' });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ success: false, message: error.message });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-history', async (req, res) => {
    const { idcard_emp } = req.body;
    const month = moment().format('YYYY-MM');
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE DATE_FORMAT(pw.request_qty_date, '%Y-%m') = ?
                AND pw.idcard_input = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, [month, idcard_emp]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/search-history', async (req, res) => {
    const { idcard_emp, date1, date2 } = req.body;
    console.log(req.body);
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE pw.request_qty_date BETWEEN ? AND ?
                AND pw.idcard_input = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, [date1, date2, idcard_emp]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-withdrawal-detail', async (req, res) => {
    const { pw_id } = req.body;
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT pw.pw_id,  wt.wt_name, pw.withdraw_id, pw.stock_id,
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y') AS date_input,
                pw.product_id, pl.product_detail, pl.product_select_mn, pw.request_id, 
                pw.request_qty, pw.withdraw_qty, 
                pu.pu_name, pw.depart_use, dep.name, pw.location_use, pw.status_id, 
                pa.status_id AS status_apr, 
                pw.withdraw_idcard,
                CONCAT(TRIM(de2.name), ' ', de2.lastname) AS full_name2,
                sm.name_status, sm.color, pw.remark_req, pa.idcard_apr
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN emp_green.data_emp de2 ON REPLACE(de2.idcard, '-', '') = pw.withdraw_idcard
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
                LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
                LEFT JOIN emp_green.depart dep ON dep.id_depart = pw.depart_use
                LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
            WHERE pw.pw_id = ?;    
        `, [pw_id]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-status-detail', async (req, res) => {
    const { pw_id } = req.body;
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                DATE_FORMAT(log.dateTime_input, '%d-%m-%Y %H:%i:%s') AS date_input, 
                sm.name_status, log.detail, log.status_id, sm.color,
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name
            FROM log_detail log
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = log.status_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard,'-','') = log.idcard_input
            WHERE log.pw_id = ? ORDER BY log.dateTime_input;    
        `, [pw_id]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/cancel-request', async (req, res) => {
    const { pw_id, request_qty, product_id, stock_id, idcard, remarkCancel, request_id } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');
    const statusId = 'ST08';

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        const Detail = remarkCancel ? `หัวหน้าไม่อนุมัติ เนื่องจาก ${remarkCancel}` : 'ยกเลิกการเบิกสแปร์พาร์ท';

        // แปลงข้อมูลจาก String เป็น Array
        const productIds = product_id.split(',').map(id => id.trim());
        const requestQtys = request_qty.split(',').map(qty => parseInt(qty.trim(), 10));
        const stockIds = stock_id.split(',').map(id => id.trim());

        for (let i = 0; i < productIds.length; i++) {
            const prodId = productIds[i];
            const reqQty = requestQtys[i] || 0;
            const stockId = stockIds[i] || null;

            // อัปเดตสถานะและลดจำนวนที่ร้องขอ
            await conn.query(`
                UPDATE product_withdraw 
                SET status_id = ?, request_qty = request_qty - ?
                WHERE pw_id = ? AND product_id = ?;
            `, [statusId, reqQty, pw_id, prodId]);

            // อัปเดตจำนวนสินค้าที่ถูกเลือกใน stock
            await conn.query(`
                UPDATE product_list 
                SET product_select_mn = product_select_mn + ?
                WHERE stock_id = ? AND product_id = ?;
            `, [reqQty, stockId, prodId]);
        }

        // อัปเดตสถานะการอนุมัติ
        await conn.query(`
            UPDATE product_approval 
            SET status_id = ? 
            WHERE pw_id = ?;
        `, [statusId, pw_id]);

        // เพิ่มข้อมูลใน log_detail
        await conn.query(`
            INSERT INTO log_detail (pw_id, status_id, idcard_input, detail, dateTime_input)
            VALUES (?, ?, ?, ?, ?);
        `, [pw_id, statusId, idcard, Detail, dateTime_input]);

        await conn.commit();

        const countResult = await countBossAprWithdrawal(req);
        console.log('countResult : ', countResult);
        if (countResult.status) {
            socket.sendSumBoss(countResult.bossCount);
        }

        const countStoreResult = await countStoreApprove(req);
        console.log('countStoreResult : ', countStoreResult);
        if (countStoreResult.status) {
            socket.sendSumStore(countStoreResult.storeAprCount);
        }

        res.status(200).json({ success: true, message: `ยกเลิกการเบิก ${pw_id} สำเร็จ` });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-store-history', async (req, res) => {
    const month = moment().format('YYYY-MM');
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE DATE_FORMAT(pw.request_qty_date, '%Y-%m') = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, [month]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/search-store-history', async (req, res) => {
    const { month1, month2 } = req.body;
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE DATE_FORMAT(pw.request_qty_date, '%Y-%m') BETWEEN ? AND ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, [month1, month2]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-store-approve', async (req, res) => {
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name, de.depart,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE pw.status_id = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, ['ST06']);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-allemployee', async (req, res) => {
    let conn;

    try {
        conn = await empGreenPool.getConnection();
        const [rows] = await conn.query(`
            SELECT  
                CONCAT(TRIM(name), ' ', lastname) AS full_name,
                REPLACE(idcard, '-', '') AS idcard_emp
            FROM data_emp
                ORDER BY name DESC;    
        `);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-waitmn-approve', async (req, res) => {
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name, de.depart,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE pw.status_id = ? AND pw.wt_id IN (?, ?)
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;    
        `, ['ST05', 'SP', 'OP']);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-waitwd-approve', async (req, res) => {
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name, de.depart,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE pw.status_id = ? AND pw.wt_id = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;  
        `, ['ST05', 'ST']);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-boss-approve', async (req, res) => {
    const { idcard } = req.body
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name, de.depart,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                GROUP_CONCAT(pw.product_id SEPARATOR ', ') AS product_id,
                GROUP_CONCAT(pw.request_qty SEPARATOR ', ') AS request_qty,
                GROUP_CONCAT(pw.stock_id SEPARATOR ', ') AS stock_id,
                pw.status_id, sm.name_status,
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
                LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
            WHERE pw.status_id = ? AND pa.idcard_apr = ?
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC; 
        `, ['ST05', idcard]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/boss-approve', async (req, res) => {
    const { pw_id, idcard, request_id } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');
    const statusId = 'ST06';

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction(); // ✅ เริ่ม transaction

        // ✅ อัปเดตตาราง product_withdraw
        const [updateWithdrawResult] = await conn.query(
            `UPDATE product_withdraw SET status_id = ? WHERE pw_id = ?`,
            [statusId, pw_id]
        );
        if (updateWithdrawResult.affectedRows === 0) {
            throw new Error(`ไม่พบข้อมูลใน product_withdraw สำหรับ pw_id: ${pw_id}`);
        }

        // ✅ อัปเดตตาราง product_approval
        const [updateApprovalResult] = await conn.query(
            `UPDATE product_approval SET status_id = ?, dateTime_apr = ? WHERE pw_id = ?`,
            [statusId, dateTime_input, pw_id]
        );
        if (updateApprovalResult.affectedRows === 0) {
            throw new Error(`ไม่พบข้อมูลใน product_approval สำหรับ pw_id: ${pw_id}`);
        }

        if (request_id) {
            const [updateRequestMsResult] = await conn.query(
                `UPDATE maint_system.request_ms SET status_id = ? WHERE request_id = ?`,
                [statusId, request_id]
            );

            if (updateRequestMsResult.affectedRows === 0) {
                throw new Error(`ไม่พบข้อมูลใน request_ms สำหรับ request_id: ${request_id}`);
            }

            const [[{ next_role_apr }]] = await conn.query(`
                SELECT COALESCE(MAX(role_apr), 0) + 1 AS next_role_apr 
                FROM maint_system.detail_apr WHERE request_id = ?;
            `, [request_id]);

            await conn.query(`
                INSERT INTO maint_system.detail_apr (request_id, idcard_input, details, role_apr, status_id, dateTime_apr) 
                VALUES (?, ?, ?, ?, ?, ?);
            `, [
                request_id, idcard, 'หัวหน้าแผนกอนุมัติเบิก', next_role_apr, statusId, dateTime_input
            ]);
        }

        // ✅ บันทึก log_detail
        await conn.query(
            `INSERT INTO log_detail (pw_id, status_id, idcard_input, detail, dateTime_input)
             VALUES (?, ?, ?, ?, ?)`,

            [pw_id, statusId, idcard, 'หัวหน้าแผนกอนุมัติเบิก', dateTime_input]
        );

        await conn.commit(); // ✅ ยืนยันการทำงาน

        const countResult = await countBossAprWithdrawal(req);
        console.log('countResult : ', countResult);
        if (countResult.status) {
            socket.sendSumBoss(countResult.bossCount);
        }

        const countStoreResult = await countStoreApprove(req);
        console.log('countStoreResult : ', countStoreResult);
        if (countStoreResult.status) {
            socket.sendSumStore(countStoreResult.storeAprCount);
        }

        // const bossApproveMnResult = await countBossApproveMn(req);
        // console.log('bossApproveMnResult : ', bossApproveMnResult);
        // if (bossApproveMnResult.status) {
        //     socket.sendSumBossAprMn(bossApproveMnResult.bossAprMnCount);
        // }

        const bossApproveResult = await countBossApproveMenu(idcard);
        console.log('bossApproveResult : ', bossApproveResult);
        if (bossApproveResult.status) {
            socket.sendSumBossApr(bossApproveResult.count);
        }

        res.status(200).json({ success: true, message: `อนุมัติการเบิก ${pw_id} สำเร็จ` });

    } catch (error) {
        if (conn) await conn.rollback(); // ❌ ยกเลิกหากมีปัญหา
        console.error(`เกิดข้อผิดพลาด: ${error.message}`, error);
        res.status(500).json({
            success: false,
            message: `เกิดข้อผิดพลาด: ${error.message}`,
            error: error.code || 'UNKNOWN_ERROR',
        });

    } finally {
        if (conn) conn.release(); // ✅ ปล่อยการเชื่อมต่อ
    }
});

router.post('/get-bossapr-history', async (req, res) => {
    const { idcard_emp } = req.body;
    const month = moment().format('YYYY-MM');
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
                LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
                LEFT JOIN log_detail ld ON pa.pw_id = ld.pw_id AND pa.status_id = ld.status_id
            WHERE DATE_FORMAT(pw.request_qty_date, '%Y-%m') = ?
                AND pa.idcard_apr = ? AND pa.dateTime_apr IS NOT NULL
                GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
                ORDER BY pw.request_qty_date DESC;  
        `, [month, idcard_emp]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/search-bossapr-history', async (req, res) => {
    const { idcard_emp, date1, date2 } = req.body;
    console.log(req.body);
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pw.id, pw.pw_id, pw.withdraw_id,  
                wt.wt_name, 
                CONCAT(TRIM(de.name), ' ', de.lastname) AS full_name,
                DATE_FORMAT(pw.request_qty_date, '%d-%m-%Y : %H:%i:%s') AS date_input,
                GROUP_CONCAT(pl.product_detail SEPARATOR ', ') AS product_detail,
                pw.status_id, sm.name_status, 
                sm.color
            FROM product_withdraw pw
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.idcard_input
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
                LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
                LEFT JOIN log_detail ld ON pa.pw_id = ld.pw_id AND pa.status_id = ld.status_id
            WHERE STR_TO_DATE(pw.request_qty_date, '%Y-%m-%d') BETWEEN ? AND ?
            AND pa.idcard_apr = ?
            GROUP BY pw.pw_id, wt.wt_name, full_name, date_input, sm.name_status, sm.color
            ORDER BY pw.request_qty_date DESC;   
        `, [date1, date2, idcard_emp]);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/store-delete-product', async (req, res) => {
    const { pw_id, request_qty, product_id, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        const Detail = `สโตร์ลบสินค้า ${product_id}`;

        await conn.query(`
            DELETE FROM product_withdraw
            WHERE pw_id = ? AND product_id = ?;
        `, [pw_id, product_id]);

        await conn.query(`
            UPDATE product_list 
            SET product_select_mn = product_select_mn + ?
            WHERE stock_id = ? AND product_id = ?;
        `, [request_qty, stock_id, product_id]);

        await conn.query(`
            INSERT INTO log_detail (pw_id, idcard_input, detail, dateTime_input)
            VALUES (?, ?, ?, ?);
        `, [pw_id, idcard, Detail, dateTime_input]);

        await conn.commit();
        res.status(200).json({ success: true, message: `ลบข้อมูล ${product_id} สำเร็จ` });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/store-save-withdrawal', async (req, res) => {
    const requestData = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');
    const year = now.add(543, 'years').format('YY');
    const month = now.format('MM');
    const sub_date = `NO ${year}${month}`;

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        let [existingWithdraw] = await conn.query(`
            SELECT withdraw_id FROM product_withdraw WHERE pw_id = ? LIMIT 1;
        `, [requestData[0].pw_id]);

        let withdraw_id;
        if (existingWithdraw.length > 0 && existingWithdraw[0].withdraw_id) {
            withdraw_id = existingWithdraw[0].withdraw_id;
        } else {
            const [lastWithdraw] = await conn.query(`
                SELECT MAX(SUBSTRING(withdraw_id, 8, 3)) AS last_id
                FROM product_withdraw
                WHERE SUBSTRING(withdraw_id, 4, 2) = ? AND SUBSTRING(withdraw_id, 6, 2) = ?;
            `, [year, month]);

            const lastId = lastWithdraw[0].last_id ? parseInt(lastWithdraw[0].last_id, 10) + 1 : 1;
            withdraw_id = `${sub_date}${String(lastId).padStart(3, '0')}`;
        }

        for (let row of requestData) {
            const { pw_id, product_id, stock_id, request_qty, realWithdrawal, selectedEmp } = row;

            const requestQty = Number(request_qty);
            let new_withdraw_qty = Number(realWithdrawal);

            const [existingWithdraw] = await conn.query(`
                SELECT withdraw_qty FROM product_withdraw 
                WHERE pw_id = ? AND product_id = ?;
            `, [pw_id, product_id]);

            if (existingWithdraw.length > 0) {
                let currentWithdraw = Number(existingWithdraw[0].withdraw_qty || 0);
                new_withdraw_qty += currentWithdraw;

                if (new_withdraw_qty > requestQty) {
                    await conn.rollback();
                    return res.status(200).json({
                        success: false,
                        message: `จำนวนเบิกรวม (${new_withdraw_qty}) มากกว่าที่ร้องขอ (${requestQty})`
                    });
                }
            }

            await conn.query(`
                UPDATE product_withdraw 
                SET withdraw_qty = ?, withdraw_id = ?, withdraw_idcard = ?, withdraw_qty_date = ?
                WHERE pw_id = ? AND product_id = ?;
            `, [new_withdraw_qty, withdraw_id, selectedEmp, dateTime_input, pw_id, product_id]);

            await conn.query(`
                UPDATE product_list 
                SET product_remain = product_remain - ?
                WHERE product_id = ? AND stock_id = ?;
            `, [realWithdrawal, product_id, stock_id]);

            if (new_withdraw_qty === requestQty) {
                await conn.query(`
                    UPDATE product_withdraw 
                    SET status_id = 'ST07' 
                    WHERE pw_id = ? AND product_id = ?;
                `, [pw_id, product_id]);
            }
        }

        // ✅ ตรวจสอบว่า pw_id นี้ เบิกครบทุกสินค้าแล้วหรือยัง
        const [remainingInPw] = await conn.query(`
            SELECT COUNT(*) AS count
            FROM product_withdraw
            WHERE pw_id = ? AND (
                COALESCE(withdraw_qty, 0) < CAST(request_qty AS UNSIGNED)
            );
        `, [requestData[0].pw_id]);

        const isCurrentPwComplete = remainingInPw[0].count === 0;

        if (isCurrentPwComplete) {
            await conn.query(`
                UPDATE product_approval 
                SET status_id = ?, idcard_store = ?, store_dateTime = ?
                WHERE pw_id = ?;
            `, ['ST07', requestData[0].idcard, dateTime_input, requestData[0].pw_id]);

            await conn.query(`
                INSERT INTO log_detail (pw_id, status_id, idcard_input, detail, dateTime_input)
                VALUES (?, ?, ?, ?, ?);
            `, [requestData[0].pw_id, 'ST07', requestData[0].idcard, 'เบิกสินค้าเรียบร้อยแล้ว', dateTime_input]);
        }

        // ✅ ตรวจสอบว่า request_id นี้ ทุก pw_id เบิกครบหรือยัง
        const [incompletePw] = await conn.query(`
            SELECT pw_id
            FROM product_approval
            WHERE pw_id IN (
                SELECT DISTINCT pw_id FROM product_withdraw WHERE request_id = ?
            )
            AND status_id != 'ST07';
        `, [requestData[0].request_id]);

        if (incompletePw.length === 0) {
            await conn.query(`
                UPDATE maint_system.request_ms 
                SET status_id = ?
                WHERE request_id = ?;
            `, ['ST07', requestData[0].request_id]);

            const [[{ next_role_apr }]] = await conn.query(`
                SELECT COALESCE(MAX(role_apr), 0) + 1 AS next_role_apr 
                FROM maint_system.detail_apr 
                WHERE request_id = ?;
            `, [requestData[0].request_id]);

            await conn.query(`
                INSERT INTO maint_system.detail_apr 
                (request_id, idcard_input, details, role_apr, status_id, dateTime_apr)
                VALUES (?, ?, ?, ?, ?, ?);
            `, [
                requestData[0].request_id,
                requestData[0].idcard,
                'เบิกสินค้าเรียบร้อยแล้ว',
                next_role_apr,
                'ST07',
                dateTime_input
            ]);
        }

        await conn.commit();

        const countStoreResult = await countStoreApprove(req);
        if (countStoreResult.status) {
            socket.sendSumStore(countStoreResult.storeAprCount);
        }

        res.status(200).json({
            success: true,
            message: `เบิกสินค้าเรียบร้อย (ID: ${withdraw_id})`
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/store-edit-product', async (req, res) => {
    const { pw_id, product_id, editQty, locationUse, departUse, stock_id, idcard } = req.body;
    console.log('📌 ข้อมูลที่รับมา:', req.body);
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();
        const Detail = `สโตร์คืนสินค้า ${product_id}`;

        // 🔹 ตรวจสอบว่ามีค่าที่ต้องอัปเดตหรือไม่
        let updateFields = [];
        let updateValues = [];

        if (editQty !== undefined) {
            updateFields.push("request_qty = request_qty - ?");
            updateValues.push(editQty);
        }
        if (locationUse !== undefined) {
            updateFields.push("location_use = ?");
            updateValues.push(locationUse);
        }
        if (departUse !== undefined) {
            updateFields.push("depart_use = ?");
            updateValues.push(departUse);
        }

        if (updateFields.length > 0) {
            updateValues.push(pw_id, stock_id, product_id);
            const updateQuery = `
                UPDATE product_withdraw 
                SET ${updateFields.join(", ")}
                WHERE pw_id = ? AND stock_id = ? AND product_id = ?;
            `;

            const [updateResult] = await conn.query(updateQuery, updateValues);
            console.log('✅ ผลลัพธ์การอัปเดต:', updateResult);

            // 🔹 อัปเดต product_list อย่างถูกต้อง
            await conn.query(`
                UPDATE product_list 
                SET product_select_mn = IFNULL(product_select_mn, 0) + ?
                WHERE stock_id = ? AND product_id = ?;
            `, [editQty, stock_id, product_id]);

        } else {
            console.log('⚠️ ไม่มีข้อมูลที่ต้องอัปเดต');
        }

        await conn.query(`
            INSERT INTO log_detail (pw_id, idcard_input, detail, dateTime_input)
            VALUES (?, ?, ?, ?);
        `, [pw_id, idcard, Detail, dateTime_input]);

        console.log('✅ บันทึก Log สำเร็จ');

        await conn.commit();
        res.status(200).json({ success: true, message: `แก้ไขข้อมูล ${product_id} สำเร็จ` });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('❌ เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-product-group', async (req, res) => {
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT CONCAT(pg_id, ' : ', pg_name) AS pg_name, pg_id
            FROM product_group;    
        `);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-product-unit', async (req, res) => {
    let conn;

    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT * FROM product_unit;    
        `);

        res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/save-product-stockb', async (req, res) => {
    const { date_received, po_number, request_id, emp_request, products, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');
    // const dateInput = now.format('YYYY-MM-DD');
    const dateInput = now.format('2025-03-09');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        // ดึง product_id ล่าสุดจาก stock_id = 'B'
        const [rows] = await conn.query(`
            SELECT product_id FROM product_list 
            WHERE stock_id = 'B' 
            ORDER BY CAST(SUBSTRING(product_id, 2) AS UNSIGNED) DESC 
            LIMIT 1
        `);

        let lastNumber = rows.length > 0 ? parseInt(rows[0].product_id.substring(1)) || 0 : 0;

        // เตรียมค่า INSERT
        const productValues = [];
        const logValues = [];

        for (const product of products) {
            lastNumber++; // เพิ่มค่า product_id ใหม่
            const newProductId = `B${lastNumber}`;

            productValues.push([
                newProductId, 'B', product.product_group, product.product_detail, product.unit,
                product.quantity, product.quantity, product.quantity,
                dateInput, idcard, po_number, request_id, product.product_number,
                emp_request, date_received, 'open'
            ]);

            logValues.push([newProductId, product.quantity, idcard, `สโตร์รับเข้าสินค้า STOCK B`, 'B', dateTime_input]);
        }

        // บันทึกสินค้าทั้งหมดในครั้งเดียว
        await conn.query(`
            INSERT INTO product_list (
                product_id, stock_id, pg_id, product_detail, pu_id, 
                product_received, product_remain, product_select_mn,
                product_date, idcard_input, po_number, request_id, 
                product_number, emp_request, date_received, status_usage
            ) VALUES ?
        `, [productValues]);

        // บันทึก log_stock ทั้งหมดในครั้งเดียว
        await conn.query(`
            INSERT INTO log_stock (product_id, product_remain, idcard_input, remarks, stock_id, dateTime_input) 
            VALUES ?
        `, [logValues]);

        await conn.commit();
        res.status(200).json({ success: true, message: 'บันทึกข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error.stack);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-product-importb', async (req, res) => {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT idcard_input, stock_id,
                DATE_FORMAT(product_date, '%d-%m-%Y') AS date_input
            FROM product_list
            WHERE stock_id = ? AND status_usage = ?
                GROUP BY product_date, idcard_input 
                ORDER BY product_date DESC
        `, ['B', 'open']);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/delete-product-importb', async (req, res) => {
    const { date_input, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        await conn.query(`
            DELETE FROM product_list 
            WHERE product_date = ? AND stock_id = ?;
        `, [date_input, stock_id]);

        const Detail = `สโตร์ลบสินค้ารับเข้า STOCK B ${date_input}`;
        await conn.query(`
            INSERT INTO log_stock (idcard_input, remarks, stock_id, dateTime_input) 
            VALUES (?, ?, ?, ?);
        `, [idcard, Detail, stock_id, dateTime_input]);

        await conn.commit();
        res.status(200).json({ success: true, message: 'ลบข้อมูลสินค้าสำเร็จ' });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('เกิดข้อผิดพลาดในการลบข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-productb', async (req, res) => {
    const { date_input } = req.body;
    try {
        let conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                pl.id, pl.product_id, pl.pg_id, pl.product_detail, pl.pu_id, 
                pu.pu_name, pl.product_received, pl.product_remain, 
                pl.product_price, pl.idcard_input, pl.stock_id,
                DATE_FORMAT(pl.product_date, '%d-%m-%Y') AS date_input
            FROM product_list pl
            LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
            WHERE pl.stock_id = ? 
            AND DATE_FORMAT(pl.product_date, '%d-%m-%Y') = ?;
        `, ['B', date_input]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/delete-productb', async (req, res) => {
    const { id, product_id, product_remain, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        await conn.query(`
            DELETE FROM product_list 
            WHERE id = ?;
        `, [id]);

        const Detail = `สโตร์ลบสินค้า STOCK B ${product_id}`;
        await conn.query(`
            INSERT INTO log_stock (product_id, product_remain, idcard_input, remarks, stock_id, dateTime_input) 
            VALUES (?, ?, ?, ?, ?, ?);
        `, [product_id, product_remain, idcard, Detail, stock_id, dateTime_input]);

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

router.post('/get-allproduct-detail', async (req, res) => {
    let conn;
    try {
        conn = await storePool.getConnection();

        const [rowsA, rowsB] = await Promise.all([
            conn.query(
                `SELECT pl.id, pl.product_id, pl.stock_id,
                    DATE_FORMAT(pl.date_received, '%d-%m-%Y') AS date_received,
                    pl.pg_id, pl.product_detail, pu.pu_name, pl.product_remain,
                    pl.product_select_mn, pl.status_usage
                FROM product_list pl
                LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
                WHERE pl.stock_id = ?;`,
                ['A']
            ),
            conn.query(
                `SELECT pl.id, pl.product_id, pl.stock_id,
                    DATE_FORMAT(pl.date_received, '%d-%m-%Y') AS date_received,
                    pl.pg_id, pl.product_detail, pu.pu_name, pl.product_remain,
                    pl.product_select_mn, pl.status_usage
                FROM product_list pl
                LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
                WHERE pl.stock_id = ?;`,
                ['B']
            )
        ]);

        res.status(200).json({ success: true, stocka: rowsA[0], stockb: rowsB[0] });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/update-product-status', async (req, res) => {
    const { id, status_usage } = req.body;
    let conn;

    try {
        conn = await storePool.getConnection();

        await conn.query(`
            UPDATE product_list
            SET status_usage = ?
            WHERE id = ?;
        `, [status_usage, id]);

        res.status(200).json({ success: true, message: 'อัปเดตสถานะสินค้าสำเร็จ' });

    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะสินค้า' });

    } finally {
        if (conn) conn.release();
    }
});

router.post('/update-product-remain', async (req, res) => {
    const { id, product_id, product_remain, productEdit, stock_id, idcard } = req.body;
    let conn;
    const now = moment();
    const dateTime_input = now.format('YYYY-MM-DD HH:mm:ss');

    try {
        conn = await storePool.getConnection();
        await conn.beginTransaction();

        await conn.query(`
            UPDATE product_list 
            SET product_remain = ?
            WHERE id = ?;
        `, [productEdit, id]);

        const Detail = `สโตร์แก้ไขจำนวนสินค้า ${product_id} เป็น ${productEdit}`;
        await conn.query(`
            INSERT INTO log_stock (product_id, product_remain, idcard_input, remarks, stock_id, dateTime_input) 
            VALUES (?, ?, ?, ?, ?, ?);
        `, [product_id, product_remain, idcard, Detail, stock_id, dateTime_input]);

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

router.post('/get-admin-setting', async (req, res) => {
    let conn;
    try {
        conn = await empGreenPool.getConnection();

        // ดึงเมนูที่ active และไม่มี menu_type (เพื่อสร้าง column dynamic)
        const [menus] = await conn.query(`
            SELECT menu_id, sub_topic 
            FROM store_system.menu_store 
            WHERE menu_active = 'yes' AND menu_type IS NULL
            ORDER BY menu_id;
        `);

        if (!menus || menus.length === 0) {
            conn.release();
            return res.status(404).json({ success: false, message: 'ไม่พบเมนูในระบบ' });
        }

        const header = ['รหัสพนักงาน', 'ชื่อ - นามสกุล', 'ตำแหน่ง', ...menus.map(m => m.sub_topic)];

        const dynamicCols = menus.map(m => {
            return `MAX(CASE WHEN tbSS.menu_id = '${m.menu_id}' THEN 'yes' END) AS \`${m.menu_id}\``;
        }).join(',\n');

        const query = `
            SELECT
                tbEG.empid,
                tbEG.name AS full_name,
                tbEG.p_name AS position_name,
                ${dynamicCols}
            FROM
                (
                    SELECT
                        REPLACE(de.idcard, '-', '') AS idcard,
                        CONCAT(TRIM(de.name), ' ', TRIM(de.lastname)) AS name,
                        p.p_name, de.empid
                    FROM
                        data_emp de
                    LEFT JOIN
                        positions p ON p.p_id = de.p_id
                    WHERE
                        de.st_emp IN (?, ?)
                ) AS tbEG
            LEFT JOIN
                store_system.menu_access AS tbMA ON REPLACE(tbEG.idcard, '-', '') = tbMA.user_idcard
            LEFT JOIN
                store_system.menu_store tbSS ON tbMA.menu_id = tbSS.menu_id
            GROUP BY
                tbEG.idcard, tbEG.name, tbEG.p_name
            ORDER BY tbMA.menu_id DESC;
        `;

        const [bodyResult] = await conn.query(query, ['ผ่านงาน', 'ทดลองงาน']);

        // ดึงเฉพาะค่าของแต่ละ record (เป็น array สำหรับ frontend table)
        const body = bodyResult.map(obj => Object.values(obj));

        conn.release();
        res.status(200).json({ success: true, header, body });
    } catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        if (conn) conn.release();
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    }
});

router.post('/update-status-usage', async (req, res) => {
    const { idcard, ...updatedFields } = req.body;

    if (!idcard || Object.keys(updatedFields).length === 0) {
        return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' });
    }

    try {
        let conn = await empGreenPool.getConnection();

        const setClause = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(updatedFields), idcard];

        const sqlQuery = `UPDATE permissions SET ${setClause} WHERE idcard = ?`;
        console.log('🔹 SQL:', sqlQuery, values);

        const [result] = await conn.query(sqlQuery, values);
        conn.release();

        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' });
        } else {
            res.status(404).json({ success: false, message: 'ไม่พบข้อมูลที่ต้องการอัปเดต หรือข้อมูลเดิมเหมือนกัน' });
        }
    } catch (error) {
        console.error('🚨 เกิดข้อผิดพลาดในการอัปเดตข้อมูล:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' });
    }
});

router.post('/get-check-product', async (req, res) => {
    const { product_id } = req.body;
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT pw.product_id, pl.product_detail, pw.pw_id, pw.withdraw_id,
                CONCAT(TRIM(de.name), ' ', de.lastname) AS name_withdraw,
                DATE_FORMAT(pw.withdraw_qty_date, '%d-%m-%Y') AS date_withdraw,
                pw.withdraw_qty, pw.location_use, pw.depart_use, pw.request_id,
                CONCAT(rm.mc_id, ' : ', md.name_mc) AS name_mc,
                wt.wt_name, pw.status_id, sm.name_status, sm.color
            FROM product_withdraw pw
                LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                LEFT JOIN emp_green.data_emp de ON REPLACE(de.idcard, '-', '') = pw.withdraw_idcard
                LEFT JOIN maint_system.request_ms rm ON rm.request_id = pw.request_id
                LEFT JOIN maint_system.machaine_detail md ON md.mc_id = rm.mc_id
                LEFT JOIN withdraw_type wt ON wt.wt_id = pw.wt_id
                LEFT JOIN maint_system.status_ms sm ON sm.status_id = pw.status_id
            WHERE pw.product_id = ?;
        `, [product_id]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-line-approve', async (req, res) => {
    let conn;
    const { status_apr } = req.body;
    try {
        conn = await empGreenPool.getConnection();
        const [rows] = await conn.query(`
            SELECT  la.status_apr, la.pp_id, pp.pp_name
            FROM line_approve la
                LEFT JOIN primary_position pp ON pp.pp_id = la.pp_id
            WHERE la.status_apr = ?;
        `, [status_apr]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/get-menu-approve', async (req, res) => {
    const { empid } = req.body;
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT 
                REPLACE(de.idcard, '-', '') AS user_idcard,
                CONCAT(TRIM(de.name), ' ', de.lastname) AS user_name,
                ma.menu_id, ms.sub_topic
            FROM emp_green.data_emp de
                LEFT JOIN menu_access ma ON ma.user_idcard = REPLACE(de.idcard, '-', '')
                LEFT JOIN menu_store ms ON ma.menu_id = ms.menu_id
            WHERE de.empid = ?
        `, [empid]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release(); // ✅ conn ตัวนอกจะมีค่าจาก try block
    }
});

router.post('/get-menu-access', async (req, res) => {
    const { user_idcard } = req.body;
    let conn;
    try {
        conn = await storePool.getConnection();

        const [rows] = await conn.query(`
            SELECT ms.menu_id, ms.sub_topic
            FROM menu_store ms
            LEFT JOIN menu_access ma 
                ON ms.menu_id = ma.menu_id 
                AND ma.user_idcard = ?
            WHERE ms.menu_active = ?
                AND ms.menu_type IS NULL
                AND ma.menu_id IS NULL;
        `,[user_idcard, 'yes']);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล :', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
    } finally {
        if (conn) conn.release();
    }
});

router.post('/add-menu-access', async (req, res) => {
    const { user_name, user_idcard, menu_ids } = req.body;
    let conn;
  
    try {
      conn = await storePool.getConnection();
  
      const insertValues = menu_ids.map(id => [user_name, user_idcard, id]);
  
      await conn.query(`
        INSERT INTO menu_access (user_name, user_idcard, menu_id)
        VALUES ?
      `, [insertValues]);
  
      res.json({ success: true, message: 'เพิ่มเมนูสำเร็จ' });
    } catch (err) {
      console.error('เพิ่มเมนูล้มเหลว:', err);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    } finally {
      if (conn) conn.release();
    }
});

router.post('/delete-menu-access', async (req, res) => {
    const { user_idcard, menu_id } = req.body;
    let conn;
  
    try {
      conn = await storePool.getConnection();
  
      await conn.query(`
        DELETE FROM menu_access WHERE user_idcard = ? AND menu_id = ?
      `, [user_idcard, menu_id]);
  
      res.json({ success: true, message: 'ลบเมนูสำเร็จ' });
    } catch (err) {
      console.error('เพิ่มเมนูล้มเหลว:', err);
      res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    } finally {
      if (conn) conn.release();
    }
});  

export default router;