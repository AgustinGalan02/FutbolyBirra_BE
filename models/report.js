import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        personEmisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person',
            required: true
        },
        personInfractor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person',
            required: true
        },
        tipoContenido: {
            type: String,
            enum: ['MENSAJE_PRIVADO', 'PUBLICACION'],
            required: true
        },
        idContenido: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        motivo: {
            type: String,
            required: true
        },
        observaciones: {
            type: String,
            default: ''
        },
        estado: {
            type: String,
            enum: ['PENDIENTE', 'RESUELTO', 'DESESTIMADO'],
            default: 'PENDIENTE'
        },
        notaResolucion: {
            type: String,
            default: ''
        },
        fechaResolucion: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export default mongoose.model('Report', reportSchema);