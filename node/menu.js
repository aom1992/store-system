import express from 'express';
import createConn from './db.js';
import { 
    countStoreApprove, 
    countBossApproveMenu, 
} from './counts.js'; // import functions

const router = express.Router();
const storePool = createConn('store_system');

router.post('/menu', async (req, res) => {
    const { idcard } = req.body;

    try {
        const conn = await storePool.getConnection();

        const [defaultMenus] = await conn.query(`
            SELECT id, menu_id, main_topic, sub_topic, url, NULL AS badge
            FROM menu_store 
            WHERE menu_type = 'default'
        `);

        const [accessMenus] = await conn.query(`
            SELECT ms.id, ms.menu_id, ms.main_topic, ms.sub_topic, ms.url,
                NULL AS badge
            FROM menu_access ma
            INNER JOIN menu_store ms ON ms.menu_id = ma.menu_id
            WHERE ms.menu_active = 'yes' AND ma.user_idcard = ?
        `, [idcard]);

        conn.release();

        // รวมรายการ menu ทั้งหมด
        const allMenus = [...defaultMenus, ...accessMenus];

        // หาว่าผู้ใช้มีสิทธิ์เข้า MN003 / MN005 ไหม
        const hasMN003 = allMenus.some(menu => menu.menu_id === 'MN003');
        const hasMN005 = allMenus.some(menu => menu.menu_id === 'MN005');

        // เรียก count เฉพาะเมนูที่ผู้ใช้มีสิทธิ์เข้า
        let bossAprCount = 0;
        let storeAprCount = 0;

        if (hasMN003) {
            const storeResult = await countBossApproveMenu(idcard);
            bossAprCount = storeResult?.count || 0;
        }

        if (hasMN005) {
            const storeResult = await countStoreApprove(req);
            storeAprCount = storeResult?.storeAprCount || 0;
        }

        // เพิ่ม badge เฉพาะเมนูที่เกี่ยวข้อง
        for (const menu of allMenus) {
            if (menu.menu_id === 'MN003' && bossAprCount > 0) {
                menu.badge = bossAprCount;
            }
            if (menu.menu_id === 'MN005' && storeAprCount > 0) {
                menu.badge = storeAprCount;
            }
        }

        // สร้าง Map เพื่อรวมรายการไม่ซ้ำ
        const menuMap = new Map();
        allMenus.forEach(menu => {
            menuMap.set(menu.menu_id, menu);
        });

        const finalMenus = Array.from(menuMap.values());

        // กลุ่มตาม main_topic
        const grouped = {};
        for (const menu of finalMenus) {
            if (!grouped[menu.main_topic]) {
                grouped[menu.main_topic] = [];
            }

            const item = {
                sub_topic: menu.sub_topic,
                url: menu.url
            };

            if (menu.badge && menu.badge > 0) {
                item.badge = menu.badge;
            }

            grouped[menu.main_topic].push(item);
        }

        const result = Object.entries(grouped).map(([main_topic, sub_topics]) => ({
            label: main_topic,
            items: sub_topics
        }));

        res.json(result);
    } catch (err) {
        console.error('Error loading menu:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;