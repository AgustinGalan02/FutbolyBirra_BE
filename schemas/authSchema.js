import { z } from 'zod'

export const registerSchema = z.object({
    username: z.string({
        required_error: 'Ingresar usuario'
    })
        .min(1, {
            message: 'Ingresar usuario'
        }),
    email: z.string({
        required_error: 'Ingresar email'
    }).email({
        message: 'Ingresar email'
    }),
    password: z.string({
        required_error: 'Ingresar contraseña'
    })
        .min(1, {
            message: 'Ingresar contraseña'
        })
        .min(6, {
            message: 'La contraseña debe tener mas de 6 caracteres'
        }),
    team: z
        .string({ required_error: "Debés elegir un equipo" })
        .min(1, "Debés elegir un equipo"),
    role: z.string({
        required_error: 'Role is required'
    }).optional()

})

export const loginSchema = z.object({
    email: z.string({
        required_error: 'Ingresar email'
    }).email({
        message: 'Ingresar email'
    })
        .min(1, {
            message: 'Email no registrado'
        }),
    password: z.string({
        required_error: 'Ingresar contraseña'
    }).min(6, {
        message: 'La contraseña debe tener mas de 6 caracteres'
    })
})
