import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js'
import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

const secretKey = process.env.TOKEN_SECRET;

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
});

export const register = async (req, res) => {
    const { username, email, password, team } = req.body;

    try {

        const userFound = await User.findOne({ email });
        if (userFound) {
            return res.status(400).json([{
                field: "email",
                message: "Email ya registrado"
            }])
        }

        const usernameFound = await User.findOne({ username });
        if (usernameFound) {
            return res.status(400).json([{
                field: "username",
                message: "Usuario ya registrado"
            }])
        }


        // ENCRIPTAMOS
        const passwordHash = await bcrypt.hash(password, 10)

        // CREAMOS USUARIO
        const newUser = new User({
            username,
            email,
            password: passwordHash,
            team
        });
        const userSaved = await newUser.save();

        // GENERAMOS TOKEN CON EL ID
        const token = await createAccessToken({ id: userSaved._id, role: userSaved.role });

        // GUARDAMOS TOKEN EN UNA COOKIE
        res.cookie('token', token, getCookieOptions());

        res.json({ // devuelve solo datos necesarios del usuario
            _id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            createdAt: userSaved.createdAt,
            updateAt: userSaved.updatedAt,
            team: userSaved.team
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // BUSCAMOS USUARIO
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json([{
            field: 'email',
            message: 'Email no registrado'
        }]);


        // COMPARAMOS CONTRASEÑA CON EL TOKEN
        const isMatch = await bcrypt.compare(password, userFound.password);

        if (!isMatch) return res.status(400).json([{
            field: 'password',
            message: 'Contraseña Incorrecta'
        }]);

        // GENERAMOS TOKEN CON EL ID
        const token = await createAccessToken({ id: userFound._id, role: userFound.role });

        // GUARDAMOS TOKEN EN UNA COOKIE
        res.cookie('token', token, getCookieOptions());

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            team: userFound.team,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    // VACIAMOS LA COOKIE
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        // PARA QUE CADUQUE INMEDIATAMENTE
        expires: new Date(0)
    });

    //OK
    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    try {
        // Buscamos al usuario por el id que dio la funcion authRequired
        const userFound = await User.findById(req.user.id);

        if (!userFound) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Si todo sale bien, devolvemos los datos
        return res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            team: userFound.team,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt
        });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const verifyToken = async (req, res) => { // OBTENEMOS EL TOKEN DE LAS COOKIES
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, secretKey, async (err, user) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });

        const userFound = await User.findById(user.id);
        if (!userFound) return res.status(401).json({ message: 'Unauthorized' });

        return res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            team: userFound.team,
            role: userFound.role
        });
    });
};