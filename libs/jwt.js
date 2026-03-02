import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// dotenv.config();

const secretKey = process.env.TOKEN_SECRET;

export function createAccessToken(payload) { // payload es la informacion que quiero guardar en el token
    return new Promise((resolve, reject) => { // devuelve una promesa
        jwt.sign(
            payload, 
            secretKey, 
            {
                expiresIn: '1d',
            },
            (err, token) => { // callback que devuelve el token o un error
                if (err) reject(err);
                else resolve(token);
            }
        );
    });
}