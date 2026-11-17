import { z } from 'zod';

export const registerSchema = z.object({
    nombre: z.string({
        required_error: 'Ingresar nombre'
    })
        .trim()
        .min(1, { message: 'El nombre no puede estar vacío' })
        .max(60, { message: 'El nombre no puede tener más de 60 caracteres' }),
    apellido: z.string({
        required_error: 'Ingresar apellido'
    })
        .trim()
        .min(1, { message: 'El apellido no puede estar vacío' })
        .max(60, { message: 'El apellido no puede tener más de 60 caracteres' }),
    username: z.string({
        required_error: 'Ingresar usuario'
    })
        .min(1, { message: 'El usuario no puede estar vacío' })
        .min(3, { message: 'El usuario debe tener al menos 3 caracteres' })
        .max(20, { message: 'El usuario no puede tener más de 20 caracteres' })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: 'El usuario solo puede contener letras, números y guiones bajos (sin espacios)'
        })
        .transform(val => val.trim()),
    email: z.string({
        required_error: 'Ingresar email'
    })
        .min(1, { message: 'El email no puede estar vacío' })
        .email({ message: 'Ingresar un email válido' })
        .toLowerCase()
        .transform(val => val.trim()),
    password: z.string({
        required_error: 'Ingresar contraseña'
    })
        .min(1, { message: 'La contraseña no puede estar vacía' })
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
        .max(50, { message: 'La contraseña no puede tener más de 50 caracteres' }),
    fechaNacimiento: z.string({
        required_error: 'Ingresar fecha de nacimiento'
    })
        .min(1, { message: 'Ingresar fecha de nacimiento' })
        .refine((val) => {
            const date = new Date(val);
            if (isNaN(date.getTime())) return false;
            const hoy = new Date();
            const hace13Anios = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
            return date <= hace13Anios && date.getFullYear() >= 1900;
        }, { message: 'Debés tener al menos 13 años para registrarte' }),
    team: z.string({
        required_error: 'Tenés que elegir un equipo'
    })
        .min(1, 'Tenés que elegir un equipo'),
    role: z.enum(['user', 'moderator', 'admin']).optional()
});

export const loginSchema = z.object({
    email: z.string({
        required_error: 'Ingresar email'
    })
        .min(1, { message: 'El email no puede estar vacío' })
        .email({ message: 'Ingresar un email válido' })
        .toLowerCase()
        .transform(val => val.trim()),
    password: z.string({
        required_error: 'Ingresar contraseña'
    })
        .min(1, { message: 'La contraseña no puede estar vacía' })
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});