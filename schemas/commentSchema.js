import { z } from 'zod'

export const createCommentSchema = z.object({
    content: z.string({
        required_error: 'El comentario es obligatorio'
    })
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El comentario no puede estar vacío' })
                .max(1000, { message: 'El comentario no puede superar los 1000 caracteres' })
        ),

    post: z.string({
        required_error: 'El ID del post es obligatorio'
    }).regex(/^[0-9a-fA-F]{24}$/, {
        message: 'El post debe ser un ID válido'
    })
})

export const updateCommentSchema = z.object({
    content: z.string()
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El comentario no puede estar vacío' })
                .max(1000, { message: 'El comentario no puede superar los 1000 caracteres' })
        )
        .optional()
})