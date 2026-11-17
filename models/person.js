import mongoose from 'mongoose';

const PersonSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            trim: true,
            default: ''
        },
        apellido: {
            type: String,
            trim: true,
            default: ''
        },
        fechaNacimiento: {
            type: Date
        },
        team: {
            type: String,
            default: 'Neutral'
        },
        avatar: {
            type: String,
            default: ''
        },
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Person'
            }
        ],
        friendRequests: [
            {
                from: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Person',
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model('Person', PersonSchema);