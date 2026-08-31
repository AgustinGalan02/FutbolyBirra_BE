import { z } from 'zod';

export const createAccessRestrictionSchema = z.object({
    userTarget: z.string({
        required_error: 'Target username is required',
    }).min(1, {
        message: 'Target username cannot be empty',
    }),

    tipoRestriccion: z.enum(['BLOQUEO', 'SUSPENSION'], {
        errorMap: () => ({ message: 'Tipo de restricción inválido (debe ser BLOQUEO o SUSPENSION)' }),
    }).default('BLOQUEO'),
});