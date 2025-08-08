import { promises as fs } from 'fs';  // ใช้ fs.promises
import pdfmake from 'pdfmake';
import path from 'path';
import { fileURLToPath } from 'url';
import createConnection from './db.js';

const storePool = createConnection('store_system');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// กำหนดฟอนต์
const fonts = {
    THSarabunNew: {
        normal: path.join(__dirname, 'fonts', 'THSarabunNew.ttf'),
        bold: path.join(__dirname, 'fonts', 'THSarabunNew Bold.ttf'),
        italics: path.join(__dirname, 'fonts', 'THSarabunNew Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'THSarabunNew BoldItalic.ttf')
    }
};

const printer = new pdfmake(fonts);

const getProductWithdrawData = async (pw_id) => {
    try {
        const connection = await storePool.getConnection();
        const [rows] = await connection.execute(`
                SELECT pw.pw_id, pw.stock_id, pw.product_id, pl.product_detail, pu.pu_name, pw.location_use, 
                    pw.depart_use, dp.name, 
                    CONCAT(dp.name, ' ', '(', pw.depart_use, ')') AS departuse,
                    
                    pw.wt_id, pw.request_id, rm.mc_id, rm.depart_machaine, pw.withdraw_id, pw.withdraw_qty, 
                    de1.depart AS departinput,
                    
                    CONCAT(TRIM(de1.name), ' ', de1.lastname) AS nameinput, 
                    CONCAT(TRIM(de2.name), ' ', de2.lastname) AS namewithdraw,
                    CONCAT(TRIM(de3.name), ' ', de3.lastname) AS namestore,
                    CONCAT(TRIM(de4.name), ' ', de4.lastname) AS nameapr,
                    
                    DATE_FORMAT(pa.store_dateTime, '%d-%m-%Y') AS store_date
                FROM product_withdraw pw
                    LEFT JOIN product_list pl ON pl.product_id = pw.product_id
                    LEFT JOIN product_unit pu ON pu.pu_id = pl.pu_id
                    LEFT JOIN emp_green.data_emp de1 ON REPLACE(de1.idcard,'-','') = pw.idcard_input
                    LEFT JOIN emp_green.data_emp de2 ON REPLACE(de2.idcard,'-','') = pw.withdraw_idcard
                    LEFT JOIN emp_green.depart dp ON dp.id_depart = pw.depart_use
                    LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
                    LEFT JOIN emp_green.data_emp de3 ON REPLACE(de3.idcard,'-','') = pa.idcard_store
                    LEFT JOIN emp_green.data_emp de4 ON REPLACE(de4.idcard,'-','') = pa.idcard_apr
                    LEFT JOIN maint_system.request_ms rm ON rm.request_id = pw.request_id
                WHERE pw.pw_id  = ?
            `,[pw_id]
        );
        connection.release();

        rows.forEach(row => {
            if (row.store_date) {
                row.store_date = formatThaiDate(row.store_date);
            }
        });

        return rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw error;
    }
};

const formatThaiDate = (dateStr) => {
    const [day, month, year] = dateStr.split('-').map(Number);  // ✅ ถูกต้องตามลำดับ d-m-Y
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `วันที่ ${day} เดือน ${thaiMonths[month - 1]} พ.ศ. ${year + 543}`;
};

const getBase64Image = async (imagePath) => {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error reading image file:', error);
        throw error;
    }
};

export const generatePDF = async (pw_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const productData = await getProductWithdrawData(pw_id);
            if (productData.length === 0) {
                return reject(new Error('No data found for this pw_id.'));
            }

            const imagePath = path.join(__dirname, 'images', 'APK-Green.png');
            const base64Image = await getBase64Image(imagePath);

            // ====== สร้างแถวของตารางสินค้า ======
            const productRows = (Array.isArray(productData) && productData.length > 0
                ? productData.map((item, index) => [
                    { text: index + 1, alignment: 'center', style: 'cellSmall' },
                    { text: item?.product_id ?? '-', alignment: 'center', style: 'cellSmall' },
                    { text: `${item?.product_detail ?? '-'}${item?.request_id ? ` (${item.request_id})` : ''}`, style: 'cellSmall' },
                    { text: item?.withdraw_qty ?? '-', alignment: 'center', style: 'cellSmall' },
                    { text: item?.pu_name ?? '-', alignment: 'center', style: 'cellSmall' },
                    { text: item?.nameinput ?? '-', style: 'cellSmall' },
                    { text: item?.departinput ?? '-', style: 'cellSmall' },
                    { text: (item?.wt_id === 'SP' || item?.wt_id === 'OP') ? (item?.depart_machaine ?? '-') : (item?.departuse ?? '-'), alignment: 'center', style: 'cellSmall' },
                    { text: (item?.wt_id === 'SP' || item?.wt_id === 'OP') ? (item?.mc_id ?? '-') : (item?.location_use ?? '-'), alignment: 'center', style: 'cellSmall' }
                ])
                : []
            );

            // เติมแถวว่างถ้าน้อยกว่า 8 แถว
            const emptyRows = [];
            const minRows = 8;
            if (productRows.length < minRows) {
                for (let i = productRows.length; i < minRows; i++) {
                    emptyRows.push([
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' },
                        { text: ' ' }
                    ]);
                }
            }

            // Header ของ table
            const tableBody = [
                [
                    { text: 'ลำดับ', bold: true, alignment: 'center' },
                    { text: 'รหัส', bold: true, alignment: 'center' },
                    { text: 'รายการ', bold: true, alignment: 'center' },
                    { text: 'จำนวน', bold: true, alignment: 'center' },
                    { text: 'หน่วย', bold: true, alignment: 'center' },
                    { text: 'ผู้ขอเบิก', bold: true, alignment: 'center' },
                    { text: 'แผนกผู้ขอเบิก', bold: true, alignment: 'center' },
                    { text: 'แผนกที่ใช้งาน', bold: true, alignment: 'center' },
                    { text: 'จุดงานที่ซ่อม', bold: true, alignment: 'center' }
                ],
                ...productRows,
                ...emptyRows
            ];

            // ========== Document Definition ==========
            const docDefinition = {
                pageMargins: [30, 20, 30, 30],
                content: [
                    { text: `${productData[0]?.withdraw_id}`, style: 'withdrawId' },
                    {
                        table: {
                            widths: [140, 226, 140],
                            headerRows: 2,
                            body: [
                                [
                                    {
                                        rowSpan: 4,
                                        image: base64Image,
                                        width: 125,
                                        height: 56,
                                        alignment: 'center',
                                        margin: [0, 10, 0, 0]
                                    },
                                    {
                                        rowSpan: 4,
                                        style: 'header',
                                        alignment: 'center',
                                        text: 'ใบขอเบิก',
                                        margin: [5, 30, 5, 6]
                                    },
                                    { text: 'รหัสเอกสาร : FM-STD-001-001' }
                                ],
                                ['', '', { text: 'วันที่เริ่มใช้ : 01/05/61' }],
                                ['', '', { text: 'แก้ไขครั้งที่ : 02' }],
                                ['', '', { text: 'หน้าที่ : 1/1' }]
                            ]
                        }
                    },
                    {
                        table: {
                            widths: [524],
                            body: [
                                [
                                    {
                                        text: `${productData[0]?.store_date}`,
                                        border: [true, false, true, false],
                                        style: 'subheader'
                                    }
                                ]
                            ]
                        }
                    },
                    {
                        style: 'tableExample',
                        table: {
                            widths: [20, 48, 101, 25, 25, 56, 59, 65, 53],
                            body: tableBody
                        }
                    },
                    {
                        table: {
                            widths: [169, 169, 168],
                            body: [
                                [
                                    {
                                        text: `ลงชื่อ ${productData[0]?.namestore} \n(เจ้าหน้าที่)`,
                                        border: [true, false, false, true],
                                        style: 'approved'
                                    },
                                    {
                                        text: `ลงชื่อ ${'.'.repeat(50)} \n(ผู้รับสินค้า)`,
                                        border: [false, false, false, true],
                                        style: 'approved'
                                    },
                                    {
                                        text: `ลงชื่อ ${productData[0]?.nameapr} \n(ผู้อนุมัติ)`,
                                        border: [false, false, true, true],
                                        style: 'approved'
                                    }
                                ]
                            ]
                        }
                    }
                ],
                styles: {
                    withdrawId: {
                        fontSize: 20,
                        bold: true,
                        color: 'red',
                        alignment: 'right',
                        margin: [0, 0, 0, -3]
                    },
                    header: { fontSize: 18, bold: true, alignment: 'center' },
                    subheader: { fontSize: 14, bold: true, alignment: 'center' },
                    approved: { fontSize: 12, alignment: 'center', lineHeight: 0.9, margin: [0, 15, 0, 2] },
                    tableExample: {},
                    cellSmall: { lineHeight: 0.9, margin: [0, 0, 0, 1] }
                },
                defaultStyle: {
                    font: 'THSarabunNew'
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            let chunks = [];
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();

        } catch (err) {
            reject(err);
        }
    });
};

export const generateStockPDF = async (stockData, type) => {
    console.log('Received type >>', type);
    return new Promise(async (resolve, reject) => {
        try {
            const imagePath = path.join(__dirname, 'images', 'APK-Green.png');
            const base64Image = await getBase64Image(imagePath);

            const docDefinition = {
                pageMargins: [20, 20, 20, 20],
                content: [
                    {
                        table: {
                            widths: [138, 398],
                            headerRows: 1,
                            body: [
                                [
                                    {
                                        image: base64Image,
                                        width: 100,
                                        height: 40,
                                        alignment: 'center',
                                        margin: [0, 2, 0, 2],
                                        border: [true, true, true, false],
                                    },
                                    {
                                        style: 'header',
                                        alignment: 'center',
                                        text: `รายการตรวจนับสต๊อก ${type}`,
                                        margin: [0, 12, 0, 0],
                                        border: [true, true, true, false],
                                    }
                                ]
                            ]
                        }
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: [50, 20, 50, 251, 40, 40, 40],
                            body: [
                                [
                                    { text: 'วันที่รับ', bold: true, alignment: 'center' },
                                    { text: 'กลุ่ม', bold: true, alignment: 'center' },
                                    { text: 'รหัสสินค้า', bold: true, alignment: 'center' },
                                    { text: 'รายการสินค้า', bold: true, alignment: 'center' },
                                    { text: 'คงเหลือ', bold: true, alignment: 'center' },
                                    { text: 'หน่วยนับ', bold: true, alignment: 'center' },
                                    { text: 'หมายเหตุ', bold: true, alignment: 'center' }
                                ],
                                ...stockData.map(item => [
                                    { text: item.date_received || '-', alignment: 'center' },
                                    { text: item.pg_id || '-', alignment: 'center' },
                                    item.product_id || '-',
                                    item.product_detail || '-',
                                    { text: item.product_remain || '-', alignment: 'center' },
                                    item.pu_name || '-',
                                    ''
                                ])
                            ]
                        }
                    }
                ],
                styles: {
                    header: { fontSize: 18, bold: true, alignment: 'center' }
                },
                defaultStyle: {
                    font: 'THSarabunNew'
                }
            };

            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            let chunks = [];
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();

        } catch (error) {
            reject(error);
        }
    });
};
