import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

export const getConversations = async (req, res) => {
    try {
        const currentUsername = req.user.username;

        const conversations = await Conversation.find({
            members: { $in: [currentUsername] }
        }).sort({ fechaUltimaActualizacion: -1 });

        return res.json(conversations);
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