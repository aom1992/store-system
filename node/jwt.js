import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// สร้าง __dirname ขึ้นมาใหม่
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// อ่าน Public/Private Key
const publicKEY = fs.readFileSync(path.join(__dirname, '/public.key'), 'utf-8');
const privateKEY = fs.readFileSync(path.join(__dirname, '/private.key'), 'utf-8');

// ฟังก์ชันสำหรับตรวจสอบ token
export function verifyToken(token) {
    const verifyOptions = {
        expiresIn: '12h',
        algorithm: ['RS256']
    };
    return jwt.verify(token, publicKEY, verifyOptions, (err, decoded) => {
        if (err) {
            return { auth: false, message: 'Token หมดอายุ กรุณาเข้าระบบใหม่อีกครั้ง' };
        } else {
            return { auth: true, decoded: decoded };
        }
    });
}

// ฟังก์ชันสำหรับเซ็นชื่อ token
export function sign(payload) {
    const signOptions = {
        expiresIn: '7d',
        algorithm: 'RS256'
    };
    return jwt.sign(payload, privateKEY, signOptions);
}

// Middleware สำหรับตรวจสอบ token
export function verify(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'ไม่มีสิทธิเข้าใช้งานระบบ' });
    }

    const verifyOptions = {
        expiresIn: '12h',
        algorithm: ['RS256']
    };

    jwt.verify(token, publicKEY, verifyOptions, (err) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Token หมดอายุ กรุณาเข้าระบบใหม่อีกครั้ง' });
        }
        next();
    });
}