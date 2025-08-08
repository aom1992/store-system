import express from 'express';
import createConn from './db.js';
import { sign } from './jwt.js';
const router = express.Router();
const pool = createConn('emp_green');

async function login(username, password) {
  let conn;
  try {
    conn = await pool.getConnection();
    const query = `
      SELECT 
        CONCAT(TRIM(de.name), ' ', de.lastname) AS name,
        de.empid,
        REPLACE(idcard, '-', '') AS idcard,
        de.depart,
        de.position,
        de.id_depart,
        de.username,
        de.password,
        p.p_id,
        p.pp_id,
        pp.status_apr
      FROM data_emp de
      LEFT JOIN positions p ON p.p_id = de.p_id
      LEFT JOIN primary_position pp ON pp.pp_id = p.pp_id
      WHERE username = ? 
        AND password = ? 
        AND st_emp IN ('ผ่านงาน', 'ทดลองงาน')
      LIMIT 1;
    `;
    const [rows] = await conn.query(query, [username, password]);

    if (rows.length > 0) {
      return { status: true, message: "Login สำเร็จ", doc: rows };
    } else {
      return { status: false, message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง !!" };
    }
  } catch (err) {
    console.log('Database error:', err);
    return { status: false, message: "ไม่สามารถเชื่อมต่อฐานข้อมูลได้" };
  } finally {
    console.log('End Login');
    if (conn) conn.release(); // ✅ ตรวจสอบก่อน release
  }
}

  
router.post('/login-green', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await login(username, password);
    if (result.status && result.doc?.length > 0) {
      const payload = {
        empid: result.doc[0].empid,
        name: result.doc[0].name,
        idcard: result.doc[0].idcard,
        depart: result.doc[0].depart,
        id_depart: result.doc[0].id_depart,
        position: result.doc[0].position,
        p_id: result.doc[0].p_id,
        pp_id: result.doc[0].pp_id,
        status_apr: result.doc[0].status_apr
      };
      const token = sign(payload);
      console.log(`/login-green username: ${username}`);
      res.status(200).json({ status: true, token: token, message: "Login สำเร็จ !!" });
    } else {
      res.status(200).json({ status: false, token: "", message: result.message });
    }
  } catch (err) {
    res.status(500).json({ status: false, token: "", message: "เกิดข้อผิดพลาดทางเซิร์ฟเวอร์" });
  }
});

router.post('/login-auto', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await login(username, password);
    if (result.status && result.doc?.length > 0) {
      const payload = {
        empid: result.doc[0].empid,
        name: result.doc[0].name,
        idcard: result.doc[0].idcard,
        depart: result.doc[0].depart,
        id_depart: result.doc[0].id_depart,
        position: result.doc[0].position,
        p_id: result.doc[0].p_id,
        pp_id: result.doc[0].pp_id,
        status_apr: result.doc[0].status_apr
      };
      const token = sign(payload);
      console.log(`/login-green username: ${username}`);
      res.redirect(`https://www.apkgreen.co.th/intranet/store_system/#/login?token=${token}&type=store`);
    } else {
      res.send(`<script>alert("${result.message}"); window.location.href='/'</script>`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("เกิดข้อผิดพลาดทางเซิร์ฟเวอร์");
  }
});

export default router;