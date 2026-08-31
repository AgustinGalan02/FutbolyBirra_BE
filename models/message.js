import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: String, required: true }, // username del emisor
    receiver: { type: String, required: true }, // username del receptor
    content: { type: String, required: true, trim: true },
    leido: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);