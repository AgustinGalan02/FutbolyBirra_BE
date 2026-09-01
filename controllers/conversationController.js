import Conversation from '../models/conversation.js';
import Message from '../models/message.js';
import User from '../models/user.js';

export const getConversations = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        const currentUsername = currentUser.username;

        const conversations = await Conversation.find({
            members: currentUsername
        }).sort({ fechaUltimaActualizacion: -1 });

        return res.json(conversations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const acceptConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUsername = req.user.username;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        if (!conversation.members.includes(currentUsername)) {
            return res.status(403).json({ message: 'No tienes permiso para aceptar esta conversación' });
        }

        conversation.status = 'accepted';
        await conversation.save();

        return res.json({ message: 'Solicitud de mensaje aceptada', conversation });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteConversation = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUsername = req.user.username;

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversación no encontrada' });
        }

        if (!conversation.members.includes(currentUsername)) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta conversación' });
        }

        await Message.deleteMany({ conversationId: id });
        await Conversation.findByIdAndDelete(id);

        return res.json({ message: 'Conversación eliminada con éxito' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};