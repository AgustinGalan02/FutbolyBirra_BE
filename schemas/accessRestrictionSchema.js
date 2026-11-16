import { z } from 'zod';

export const createAccessRestrictionSchema = z.object({
    personTarget: z.string({
        required_error: 'El ID de la persona destino es obligatorio',
    }).min(1, {
        message: 'El ID de la persona destino no puede estar vacío',
    }),

    tipoRestriccion: z.enum(
        ['BLOQUEO', 'ADVERTENCIA', 'SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'],
        {
            errorMap: () => ({
                message: 'Tipo de restricción inválido (debe ser BLOQUEO, ADVERTENCIA, SUSPENSION_TEMPORAL o BANEO_PERMANENTE)',
            }),
        }
    ).default('BLOQUEO'),

    motivo: z.string().max(500, {
        message: 'El motivo no puede superar los 500 caracteres',
    }).optional(),

    diasSuspension: z.coerce.number().int().positive({
        message: 'Los días de suspensión deben ser un número entero positivo',
    }).optional(),

    reportOrigin: z.string().nullable().optional(),
});