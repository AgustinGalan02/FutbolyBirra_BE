import { z } from 'zod';

export const createConversationSchema = z.object({
  receiver: z.string({
    required_error: 'Receiver username is required',
  }).min(1, {
    message: 'Receiver username cannot be empty',
  }),
});