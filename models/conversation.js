import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    members: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'accepted'
    },
    initiatedBy: {
        type: String, // username del que envió el primer mensaje
        required: true
    },
    fechaUltimaActualizacion: {
        type: Date,
        default: Date.now
    },
    indicadorPendientes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);