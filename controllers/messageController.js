import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import AccessRestriction from '../models/accessRestriction.js';
import User from '../models/user.js';
import { emitToUser } from '../socket.js';

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
        const senderPersonId = req.user.personId;
        const { receiver, content, conversationId } = req.body;

        if (sender === receiver) {
            return res.status(400).json({ message: 'No puedes enviarte mensajes a ti mismo' });
        }

        // Obtener el personId del destinatario
        const receiverUser = await User.findOne({ username: receiver });
        if (!receiverUser || !receiverUser.person) {
            return res.status(404).json({ message: 'Destinatario no encontrado' });
        }
        const receiverPersonId = receiverUser.person;

        // 1. Validar si la persona emisora tiene una sanción disciplinaria vigente
        const ahora = new Date();
        const sancionActiva = await AccessRestriction.findOne({
            personTarget: senderPersonId,
            activa: true,
            tipoRestriccion: { $in: ['SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'] },
            $or: [{ fechaFin: null }, { fechaFin: { $gt: ahora } }]
        });

        if (sancionActiva) {
            return res.status(403).json({
                message: 'Tu cuenta se encuentra suspendida temporalmente para enviar mensajes.'
            });
        }

        // 2. Validar bloqueo previo entre ambas Personas
        const isBlocked = await AccessRestriction.findOne({
            activa: true,
            tipoRestriccion: 'BLOQUEO',
            $or: [
                { personOrigin: senderPersonId, personTarget: receiverPersonId },
                { personOrigin: receiverPersonId, personTarget: senderPersonId }
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

        emitToUser(receiverUser._id, 'new_message', {
            message: savedMessage,
            conversationId: conversation._id
        });
        
        return res.status(201).json({
            message: savedMessage,
            conversationId: conversation._id
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};