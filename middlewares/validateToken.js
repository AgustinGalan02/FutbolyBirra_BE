import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const secretKey = process.env.TOKEN_SECRET;

export const authRequired = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    jwt.verify(token, secretKey, (error, user) => {
        if (error) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admins only. ' + req.user.role, 
        });
    }
    next();
};