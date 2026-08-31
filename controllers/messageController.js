import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import AccessRestriction from '../models/AccessRestriction.js';

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const currentUsername = req.user.username;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        if (!conversation.members.includes(currentUsername)) {
            return res.status(403).json({ message: 'No tienes acceso a estos mensajes' });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

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
        const sender = req.user.username;
        const { receiver, content, conversationId } = req.body;

        if (sender === receiver) {
            return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' });
        }

        // Validar bloqueo previo
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

        // Obtener o crear conversación
        let conversation;
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
        } else {
            conversation = await Conversation.findOne({
                members: { $all: [sender, receiver] }
            });
        }

        if (!conversation) {
            conversation = new Conversation({
                members: [sender, receiver],
                fechaUltimaActualizacion: new Date(),
                indicadorPendientes: 1
            });
            await conversation.save();
        } else {
            conversation.fechaUltimaActualizacion = new Date();
            conversation.indicadorPendientes += 1;
            await conversation.save();
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender,
            receiver,
            content
        });

        const savedMessage = await newMessage.save();

        return res.status(201).json({
            message: savedMessage,
            conversationId: conversation._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};