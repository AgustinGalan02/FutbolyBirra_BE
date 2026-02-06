import { z } from 'zod'

export const createCategorySchema = z.object({
    title: z.string({
        required_error: 'Title is required'
    }).min(1, {
        message: 'Title cannot be empty'
    }).max(100, {
        message: 'Title must be less than 100 characters'
    }),
    
    description: z.string({
        required_error: 'Description is required'
    }).min(1, {
        message: 'Description cannot be empty'
    }).max(500, {
        message: 'Description must be less than 500 characters'
    })
})

export const updateCategorySchema = z.object({
    title: z.string()
        .min(1, { message: 'Title cannot be empty' })
        .max(100, { message: 'Title must be less than 100 characters' })
        .optional(),
    
    description: z.string()
        .min(1, { message: 'Description cannot be empty' })
        .max(500, { message: 'Description must be less than 500 characters' })
        .optional()
})