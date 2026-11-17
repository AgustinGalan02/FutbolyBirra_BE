import User from '../models/user.js';
import Person from '../models/person.js';
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
    const { username, email, password, team, nombre, apellido, dni, fechaNacimiento } = req.body;

    try {
        const userFound = await User.findOne({ email });
        if (userFound) {
            return res.status(400).json([{
                field: 'email',
                message: 'Email ya registrado'
            }]);
        }

        const usernameFound = await User.findOne({ username });
        if (usernameFound) {
            return res.status(400).json([{
                field: 'username',
                message: 'Usuario ya registrado'
            }]);
        }

        // 1. CREAR ENTIDAD PERSONA (Datos de negocio / perfil)
        const newPerson = new Person({
            nombre: nombre || '',
            apellido: apellido || '',
            dni: dni || undefined,
            fechaNacimiento: fechaNacimiento || undefined,
            team: team || 'Neutral'
        });
        const personSaved = await newPerson.save();

        // 2. ENCRIPTAR CONTRASEÑA Y CREAR USUARIO (Módulo de Seguridad)
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = new User({
            person: personSaved._id,
            username,
            email,
            password: passwordHash
        });
        const userSaved = await newUser.save();

        // 3. GENERAR TOKEN CON ID DE USUARIO, ID DE PERSONA Y ROL
        const token = await createAccessToken({
            id: userSaved._id,
            personId: personSaved._id,
            username: userSaved.username,
            role: userSaved.role
        });
        res.cookie('token', token, getCookieOptions());

        return res.json({
            id: userSaved._id,
            personId: personSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: userSaved.role,
            team: personSaved.team,
            nombre: personSaved.nombre,
            apellido: personSaved.apellido,
            createdAt: userSaved.createdAt,
            updatedAt: userSaved.updatedAt
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userFound = await User.findOne({ email }).populate('person');
        if (!userFound) {
            return res.status(400).json([{
                field: 'email',
                message: 'Email no registrado'
            }]);
        }

        // Verificar si la cuenta fue inhabilitada definitivamente (Baneo permanente)
        if (userFound.active === false) {
            return res.status(403).json([{
                field: 'email',
                message: 'Esta cuenta ha sido inhabilitada definitivamente'
            }]);
        }

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json([{
                field: 'password',
                message: 'Contraseña Incorrecta'
            }]);
        }

        const personId = userFound.person?._id || null;

        const token = await createAccessToken({
            id: userFound._id,
            personId,
            username: userFound.username,
            role: userFound.role
        });

        res.cookie('token', token, getCookieOptions());

        return res.json({
            id: userFound._id,
            personId,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            team: userFound.person?.team || 'Neutral',
            nombre: userFound.person?.nombre || '',
            apellido: userFound.person?.apellido || '',
            avatar: userFound.person?.avatar || '',
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(0)
    });

    return res.sendStatus(200);
};

export const profile = async (req, res) => {
    try {
        const userFound = await User.findById(req.user.id).populate('person');

        if (!userFound) {
            return res.status(400).json({ message: 'User not found' });
        }

        return res.json({
            id: userFound._id,
            personId: userFound.person?._id || null,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            team: userFound.person?.team || 'Neutral',
            nombre: userFound.person?.nombre || '',
            apellido: userFound.person?.apellido || '',
            avatar: userFound.person?.avatar || '',
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, secretKey, async (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });

        const userFound = await User.findById(decoded.id).populate('person');
        if (!userFound || userFound.active === false) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return res.json({
            id: userFound._id,
            personId: userFound.person?._id || null,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            team: userFound.person?.team || 'Neutral',
            avatar: userFound.person?.avatar || '',
            createdAt: userFound.createdAt
        });
    });
};

export const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const userFound = await User.findOne({ username })
            .select('-password')
            .populate('person');

        if (!userFound) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json({
            id: userFound._id,
            personId: userFound.person?._id || null,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            team: userFound.person?.team || 'Neutral',
            person: userFound.person,
            avatar: userFound.person?.avatar || '',
            createdAt: userFound.createdAt
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;

        if (typeof avatar !== 'string') {
            return res.status(400).json({ message: 'Imagen inválida' });
        }

        // Límite preventivo (~350 KB en base64)
        if (avatar.length > 500000) {
            return res.status(400).json({ message: 'La imagen es demasiado pesada' });
        }

        const personUpdated = await Person.findByIdAndUpdate(
            req.user.personId,
            { avatar },
            { new: true }
        );

        if (!personUpdated) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        return res.json({ avatar: personUpdated.avatar });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};