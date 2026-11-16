import mongoose from 'mongoose';

const accessRestrictionSchema = new mongoose.Schema(
    {
        personOrigin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person',
            required: true
        },
        personTarget: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person',
            required: true
        },
        reportOrigin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            default: null
        },
        tipoRestriccion: {
            type: String,
            enum: ['BLOQUEO', 'ADVERTENCIA', 'SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'],
            default: 'BLOQUEO'
        },
        motivo: {
            type: String,
            default: ''
        },
        fechaInicio: {
            type: Date,
            default: Date.now
        },
        fechaFin: {
            type: Date,
            default: null // Si es null, es permanente o advertencia sin expiración
        },
        activa: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('AccessRestriction', accessRestrictionSchema);