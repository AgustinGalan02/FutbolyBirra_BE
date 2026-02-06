import { z } from 'zod'

export const createCommentSchema = z.object({
    content: z.string({
        required_error: 'Content is required'
    }).min(1, {
        message: 'Content cannot be empty'
    }).max(1000, {
        message: 'Content must be less than 1000 characters'
    }),
    
    post: z.string({
        required_error: 'Post ID is required'
    }).regex(/^[0-9a-fA-F]{24}$/, {
        message: 'Post must be a valid ID'
    })
})

export const updateCommentSchema = z.object({
    content: z.string()
        .min(1, { message: 'Content cannot be empty' })
        .max(1000, { message: 'Content must be less than 1000 characters' })
        .optional()
})