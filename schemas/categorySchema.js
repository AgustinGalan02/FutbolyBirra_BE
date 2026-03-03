import { z } from 'zod'

export const createCategorySchema = z.object({
    title: z.string({
        required_error: 'El título es obligatorio'
    })
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El título no puede estar vacío' })
                .min(3, { message: 'El título debe tener al menos 3 caracteres' })
                .max(100, { message: 'El título no puede superar los 100 caracteres' })
        ),

    description: z.string({
        required_error: 'La descripción es obligatoria'
    })
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'La descripción no puede estar vacía' })
                .min(3, { message: 'La descripción debe tener al menos 3 caracteres' })
                .max(500, { message: 'La descripción no puede superar los 500 caracteres' })
        )
})

export const updateCategorySchema = z.object({
    title: z.string()
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'El título no puede estar vacío' })
                .min(3, { message: 'El título debe tener al menos 3 caracteres' })
                .max(100, { message: 'El título no puede superar los 100 caracteres' })
        )
        .optional(),

    description: z.string()
        .transform(val => val.trim())
        .pipe(
            z.string()
                .min(1, { message: 'La descripción no puede estar vacía' })
                .min(3, { message: 'La descripción debe tener al menos 3 caracteres' })
                .max(500, { message: 'La descripción no puede superar los 500 caracteres' })
        )
        .optional()
})