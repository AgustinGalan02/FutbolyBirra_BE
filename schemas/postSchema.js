import { z } from 'zod'

export const createPostSchema = z.object({
    title: z.string({
        required_error: 'Title is required'
    }).min(1, {
        message: 'Title cannot be empty'
    }).max(200, {
        message: 'Title must be less than 200 characters'
    }),
    
    content: z.string({
        required_error: 'Content is required'
    }).min(1, {
        message: 'Content cannot be empty'
    }),
    
    category: z.string({
        required_error: 'Category is required'
    }).regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Category must be a valid ID'
    })
})

export const updatePostSchema = z.object({
    title: z.string()
        .min(1, { message: 'Title cannot be empty' })
        .max(200, { message: 'Title must be less than 200 characters' })
        .optional(),
    
    content: z.string()
        .min(1, { message: 'Content cannot be empty' })
        .optional(),
    
    category: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, { message: 'Category must be a valid ID' })
        .optional()
})