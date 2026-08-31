import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    team: {
        type: String, default: 'Neutral'
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Lista de amigos ya aceptados
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // Solicitudes de amistad pendientes
    friendRequests: [
        {
            from: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
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

export default mongoose.model('User', UserSchema)