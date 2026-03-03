import { z } from 'zod'

export const createPostSchema = z.object({
    title: z.string({
        required_error: 'El título es obligatorio'
    })
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El título no puede estar vacío' })
                .min(3, { message: 'El título debe tener al menos 3 caracteres' })
                .max(200, { message: 'El título no puede superar los 200 caracteres' })
        ),

    content: z.string({
        required_error: 'El contenido es obligatorio'
    })
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El contenido no puede estar vacío' })
                .min(3, { message: 'El contenido debe tener al menos 3 caracteres' })
                .max(5000, { message: 'El contenido no puede superar los 5000 caracteres' })
        ),

    category: z.string({
        required_error: 'La categoría es obligatoria'
    }).regex(/^[0-9a-fA-F]{24}$/, {
        message: 'La categoría debe ser un ID válido'
    })
})

export const updatePostSchema = z.object({
    title: z.string()
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El título no puede estar vacío' })
                .min(3, { message: 'El título debe tener al menos 3 caracteres' })
                .max(200, { message: 'El título no puede superar los 200 caracteres' })
        )
        .optional(),

    content: z.string()
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El contenido no puede estar vacío' })
                .min(3, { message: 'El contenido debe tener al menos 3 caracteres' })
                .max(5000, { message: 'El contenido no puede superar los 5000 caracteres' })
        )
        .optional(),

    category: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, { message: 'La categoría debe ser un ID válido' })
        .optional()
})