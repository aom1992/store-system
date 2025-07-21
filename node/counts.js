import express from 'express';
import createConnection from './db.js';

const router = express.Router();
const storePool = createConnection('store_system');
const maintSystemPool = createConnection('maint_system');
const quotePool = createConnection('quotation_system');


//สโตร์อนุมัติเบิก
export async function countStoreApprove(req) {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT COUNT(DISTINCT pw_id) AS storeAprCount
            FROM product_withdraw
            WHERE status_id = ?
        `, ['ST06']);
        return { status: true, storeAprCount: rows[0]?.storeAprCount || 0 };
    } catch (error) {
        console.error('Error in storeAprCount:', error);
        return { status: false, message: 'ไม่สามารถ Query ได้' };
    } finally {
        if (conn) conn.release();
    }
}

router.post('/countStoreApprove', async (req, res) => {
    try {
        const result = await countStoreApprove(req);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /storeAprCount:', error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการนับข้อมูล' });
    }
});

//หัวหน้าอนุมัติเบิก
export async function countBossApprove() { // ป้องกัน req.body เป็น undefined
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT COUNT(DISTINCT pw_id) AS bossAprCount
            FROM product_withdraw
            WHERE status_id = ? AND wt_id IN (?, ?)
        `, ['ST05', 'SP', 'OP']);
        return { status: true, bossAprCount: rows[0]?.bossAprCount || 0 };
    } catch (error) {
        console.error('Error in bossAprCount:', error);
        return { status: false, message: 'ไม่สามารถ Query ได้' };
    } finally {
        if (conn) conn.release();
    }
}

router.post('/countBossApprove', async (req, res) => {
    try {
        const result = await countBossApprove();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /bossAprCount:', error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการนับข้อมูล' });
    }
});

export async function countBossApproveMn() { // ป้องกัน req.body เป็น undefined
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT COUNT(DISTINCT pw_id) AS bossAprMnCount
            FROM product_withdraw
            WHERE status_id = ? AND wt_id = ?
        `, ['ST05', 'ST']);
        return { status: true, bossAprMnCount: rows[0]?.bossAprMnCount || 0 };
    } catch (error) {
        console.error('Error in bossAprMnCount:', error);
        return { status: false, message: 'ไม่สามารถ Query ได้' };
    } finally {
        if (conn) conn.release();
    }
}

router.post('/countBossApproveMn', async (req, res) => {
    try {
        const result = await countBossApproveMn();
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /bossAprMnCount:', error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการนับข้อมูล' });
    }
});

export async function countBossAprWithdrawal(req) {
    const {idcard} = req.body;
    console.log('idcard >> ', idcard);
    let conn;
    try {
        conn = await storePool.getConnection();
        const [rows] = await conn.query(`
            SELECT COUNT(DISTINCT pw.pw_id) AS bossCount
            FROM product_withdraw pw
            LEFT JOIN product_approval pa ON pa.pw_id = pw.pw_id
            WHERE pw.status_id = ? AND pa.idcard_apr = ?
        `, ['ST05', idcard]);
        return { status: true, bossCount: rows[0]?.bossCount || 0 };
    } catch (error) {
        console.error('Error in bossCount:', error);
        return { status: false, message: 'ไม่สามารถ Query ได้' };
    } finally {
        if (conn) conn.release();
    }
}

router.post('/countBossAprWithdrawal', async (req, res) => {
    try {
        const result = await countBossAprWithdrawal(req);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /bossCount:', error);
        res.status(500).json({ status: false, message: 'เกิดข้อผิดพลาดในการนับข้อมูล' });
    }
});

export async function countBossApproveMenu(idcard) {
    let conn;
    try {
        conn = await storePool.getConnection();
        const [[{ count }]] = await conn.query(`
            SELECT COUNT(DISTINCT pw_id) AS count
            FROM product_approval
            WHERE status_id = ?
                AND idcard_apr = ?
                AND dateTime_apr IS NULL
        `, ['ST05', idcard]);
        return { status: true, count };
    } catch (err) {
        console.error('countBossApproveMenu error:', err);
        return { status: false, message: 'Query ไม่ได้', error: err.message };
    } finally {
        if (conn) conn.release();
    }
}

export async function countTopbar(idcard, depart_id) {
    console.log('idcard: ', idcard, ' ', depart_id);
    let maintConn, quoteConn;

    try {
        maintConn = await maintSystemPool.getConnection();
        quoteConn = await quotePool.getConnection();

        const [resultMn] = await maintConn.query(`
            SELECT COUNT(*) AS total
            FROM request_ms rm
                JOIN approval_ms am ON am.id_number = rm.id
            WHERE rm.status_id IN (?, ?)
                AND am.idcard_apr = ?
                AND am.dateTime_apr IS NULL
        `, ['ST01', 'ST14', idcard]);

        const [resultEngNonIT] = await maintConn.query(`
            SELECT COUNT(*) AS total
            FROM request_ms
            WHERE status_id = ? AND tw_id IN ('TW01', 'TW02', 'TW03')
        `, ['ST02']);

        const [resultEngIT] = await maintConn.query(`
            SELECT COUNT(*) AS total
            FROM request_ms
            WHERE status_id = ? AND tw_id = 'TW04'
        `, ['ST02']);

        const [resultMc] = await maintConn.query(`
            SELECT COUNT(*) AS total
            FROM request_ms
            WHERE status_id = ? AND depart_emp = ? AND tw_id <> ?
        `, ['ST14', depart_id, 'TW04']);

        const [resultMcIt] = await maintConn.query(`
            SELECT COUNT(*) AS total
            FROM request_ms
            WHERE status_id = ? AND tw_id = ?
        `, ['ST14', 'TW04']);

        const [resultQt] = await quoteConn.query(`
            SELECT COUNT(*) AS total
            FROM quotation_request qr
            JOIN quotation_approval qa ON qr.quotation_id = qa.quotation_id
            WHERE qr.status_id = ?
                AND qa.idcard_apr = ?
                AND qa.dateTime_apr IS NULL
        `, ['QST02', idcard]);

        const [resultQo] = await quoteConn.query(`
            SELECT COUNT(*) AS total
            FROM quotation_outside qo
            JOIN quotation_approval qa ON qo.outside_id = qa.quotation_id
            WHERE qo.status_id = ?
              AND qa.idcard_apr = ?
              AND qa.dateTime_apr IS NULL
        `, ['QST02', idcard]);

        // Extract values safely
        const countApproval = resultMn?.[0]?.total ?? 0;
        const countEngNonIT = resultEngNonIT?.[0]?.total ?? 0;
        const countEngIT = resultEngIT?.[0]?.total ?? 0;
        const countmc = resultMc?.[0]?.total ?? 0;
        const countmcit = resultMcIt?.[0]?.total ?? 0;
        const countqt = resultQt?.[0]?.total ?? 0;
        const countqo = resultQo?.[0]?.total ?? 0;

        const useMcIt = Number(depart_id) === 904;

        // คำนวณรวม
        const totalRepair = useMcIt
            ? countApproval + countmcit + countEngIT
            : countApproval + countEngNonIT;

        const totalQuote = countqt + countqo;

        // สร้าง response
        const response = {
            status: true,
            totalRepair,
            totalQuote
        };

        if (useMcIt) {
            response.countmcit = countmcit;
        } else {
            response.countmc = countmc;
        }

        return response;

    } catch (err) {
        console.error('countTopbar error:', err);
        return { status: false, message: 'Query ไม่ได้', error: err.message };
    } finally {
        if (maintConn) maintConn.release();
        if (quoteConn) quoteConn.release();
    }
}

router.post('/count-topbar', async (req, res) => {
    const { idcard, depart_id } = req.body;
    const result = await countTopbar(idcard, depart_id);
    res.json(result);
});


export default router;