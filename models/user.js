import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        person: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Person',
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['user', 'moderator', 'admin'],
            default: 'user'
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model('User', UserSchema);