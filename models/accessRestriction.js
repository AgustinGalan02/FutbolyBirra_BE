import mongoose from 'mongoose';

const accessRestrictionSchema = new mongoose.Schema({
    userOrigin: { type: String, required: true },
    userTarget: { type: String, required: true },
    tipoRestriccion: { type: String, enum: ['BLOQUEO', 'SUSPENSION'], default: 'BLOQUEO' },
    fechaRegistro: { type: Date, default: Date.now }
});

export default mongoose.model('AccessRestriction', accessRestrictionSchema);