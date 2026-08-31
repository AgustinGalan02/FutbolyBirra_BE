import { z } from 'zod';

export const createMessageSchema = z.object({
  receiver: z.string({
    required_error: 'Receiver username is required',
  }).min(1, {
    message: 'Receiver cannot be empty',
  }),

  content: z.string({
    required_error: 'Content is required',
  }).min(1, {
    message: 'Content cannot be empty',
  }).max(1000, {
    message: 'Message must be less than 1000 characters',
  }),

  conversationId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Conversation must be a valid ID',
    })
    .optional(), // Opcional por si se envía el primer mensaje iniciando el chat
});