import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  members: [{ type: String, required: true }], // Array con los dos username
  fechaUltimaActualizacion: { type: Date, default: Date.now },
  indicadorPendientes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);