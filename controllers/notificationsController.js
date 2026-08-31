import Notification from '../models/notification.js';

// Obtener todas las notificaciones del usuario logueado
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'username team')
            .populate('post', 'title')
            .sort({ createdAt: -1 })
            .limit(20);

        return res.json(notifications);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Marcar una notificación individual como leída
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        return res.json(notification);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Marcar todas las notificaciones del usuario como leídas
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, read: false },
            { read: true }
        );

        return res.json({ message: 'Todas las notificaciones fueron marcadas como leídas' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};