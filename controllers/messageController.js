import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import AccessRestriction from '../models/accessRestriction.js';
import User from '../models/user.js';

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const currentUsername = currentUser.username;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        // Validamos si el usuario forma parte de la conversación
        if (!conversation.members.includes(currentUsername)) {
            return res.status(403).json({ message: 'No tienes acceso a estos mensajes' });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        // Marcar como leídos los mensajes dirigidos a este usuario
        await Message.updateMany(
            { conversationId, receiver: currentUsername, leido: false },
            { $set: { leido: true } }
        );

        return res.json(messages);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { receiver, content, conversationId } = req.body;

        const senderUser = await User.findById(req.user.id).populate('friends', 'username');
        if (!senderUser) {
            return res.status(404).json({ message: 'Usuario remitente no encontrado' });
        }

        const sender = senderUser.username;

        if (!receiver || !content || !content.trim()) {
            return res.status(400).json({ message: 'Faltan campos requeridos (receiver y content)' });
        }

        if (sender === receiver) {
            return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' });
        }

        const receiverUser = await User.findOne({ username: receiver });
        if (!receiverUser) {
            return res.status(404).json({ message: 'El usuario destinatario no existe' });
        }

        // 1. Validar bloqueo previo
        const isBlocked = await AccessRestriction.findOne({
            $or: [
                { userOrigin: sender, userTarget: receiver },
                { userOrigin: receiver, userTarget: sender }
            ]
        });

        if (isBlocked) {
            return res.status(403).json({
                message: 'No puedes enviar mensajes debido a restricciones de bloqueo activas.'
            });
        }

        // 2. Comprobar si son amigos
        const isFriend = senderUser.friends.some(f => f.username === receiver);

        // 3. Buscar SIEMPRE la conversación compartida existente (por ID o por ambos miembros)
        let conversation = null;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        }

        if (!conversation) {
            conversation = await Conversation.findOne({
                members: { $all: [sender, receiver], $size: 2 }
            });
        }

        if (!conversation) {
            // Conversación nueva: 'accepted' si son amigos, 'pending' si es solicitud
            conversation = new Conversation({
                members: [sender, receiver],
                status: isFriend ? 'accepted' : 'pending',
                initiatedBy: sender,
                fechaUltimaActualizacion: new Date(),
                indicadorPendientes: 1
            });
            await conversation.save();
        } else {
            // Regla de solicitud pendiente para no amigos (máximo 1 mensaje hasta que acepten)
            if (!isFriend && conversation.status === 'pending') {
                const messageCount = await Message.countDocuments({
                    conversationId: conversation._id,
                    sender
                });

                if (messageCount >= 1 && conversation.initiatedBy === sender) {
                    return res.status(403).json({
                        message: 'Solo puedes enviar 1 mensaje hasta que el usuario acepte tu solicitud.'
                    });
                }
            }

            conversation.fechaUltimaActualizacion = new Date();
            conversation.indicadorPendientes = (conversation.indicadorPendientes || 0) + 1;
            await conversation.save();
        }

        // 4. Guardar el mensaje asignado a la conversación
        const newMessage = new Message({
            conversationId: conversation._id,
            sender,
            receiver,
            content: content.trim()
        });

        const savedMessage = await newMessage.save();

        return res.status(201).json({
            message: savedMessage,
            conversation
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};