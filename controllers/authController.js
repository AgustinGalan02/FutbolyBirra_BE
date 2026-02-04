import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js'

export const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // ENCRIPTAMOS
        const passwordHash = await bcrypt.hash(password, 10)

        // CREAMOS USUARIO
        const newUser = new User({
            username,
            email,
            password: passwordHash
        });
        const userSaved = await newUser.save();

        // GENERAMOS TOKEN CON EL ID
        const token = await createAccessToken({ id: userSaved._id , role: userSaved.role});

        // GUARDAMOS TOKEN EN UNA COOKIE
        res.cookie('token', token)

        res.json({ // devuelve solo datos necesarios del usuario
            _id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            createdAt: userSaved.createdAt,
            updateAt: userSaved.updatedAt
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
        if (!userFound) return res.status(400).json({ message: 'User not found' });


        // COMPARAMOS CONTRASEÑA CON EL TOKEN
        const isMatch = await bcrypt.compare(password, userFound.password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        // GENERAMOS TOKEN CON EL ID
        const token = await createAccessToken({ id: userFound._id , role: userFound.role});

        // GUARDAMOS TOKEN EN UNA COOKIE
        res.cookie('token', token)

        res.json({
            _id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            createdAt: userFound.createdAt,
            updateAt: userFound.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    // VACIAMOS LA COOKIE
    res.cookie('token', '', {

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
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt
        });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};