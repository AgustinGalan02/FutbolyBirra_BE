import User from '../models/user.js';
import Notification from '../models/notification.js';


// Obtener amigos y solicitudes pendientes del usuario logueado
export const getFriendsData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('friends', 'username team')
            .populate('friendRequests.from', 'username team');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        return res.json({
            friends: user.friends || [],
            friendRequests: user.friendRequests || []
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Enviar solicitud de amistad a otro usuario (por username)
export const sendFriendRequest = async (req, res) => {
    try {
        const { targetUsername } = req.params;
        const currentUserId = req.user.id;

        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser) {
            return res.status(404).json({ message: 'Usuario destinatario no encontrado' });
        }

        // Validar que no se agregue a sí mismo
        if (targetUser._id.toString() === currentUserId) {
            return res.status(400).json({ message: 'No podés enviarte una solicitud a vos mismo' });
        }

        // Validar si ya son amigos
        if (targetUser.friends.includes(currentUserId)) {
            return res.status(400).json({ message: 'Ya son amigos' });
        }

        // Validar si ya le envió una solicitud previamente
        const alreadyRequested = targetUser.friendRequests.some(
            (req) => req.from.toString() === currentUserId
        );

        if (alreadyRequested) {
            return res.status(400).json({ message: 'Ya enviaste una solicitud a este usuario' });
        }

        // Agregar la solicitud al destinatario
        targetUser.friendRequests.push({ from: currentUserId });
        await targetUser.save();

        await Notification.create({
            recipient: targetUser._id,
            sender: currentUserId,
            type: 'friend_request'
        });

        return res.json({ message: 'Solicitud de amistad enviada con éxito' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Aceptar solicitud de amistad
export const acceptFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);
        const senderUser = await User.findById(senderId);

        if (!currentUser || !senderUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar que exista la solicitud en la lista del usuario actual
        const requestIndex = currentUser.friendRequests.findIndex(
            (r) => r.from.toString() === senderId
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No hay ninguna solicitud de este usuario' });
        }

        // Remover la solicitud de la lista
        currentUser.friendRequests.splice(requestIndex, 1);

        // Agregar mutuamente como amigos si no están ya en la lista
        if (!currentUser.friends.includes(senderId)) {
            currentUser.friends.push(senderId);
        }
        if (!senderUser.friends.includes(currentUserId)) {
            senderUser.friends.push(currentUserId);
        }

        await currentUser.save();
        await senderUser.save();

        return res.json({ message: 'Solicitud aceptada correctamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Rechazar solicitud de amistad
export const rejectFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Filtrar y remover la solicitud
        currentUser.friendRequests = currentUser.friendRequests.filter(
            (r) => r.from.toString() !== senderId
        );

        await currentUser.save();

        return res.json({ message: 'Solicitud rechazada' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar a un amigo de la lista
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const currentUserId = req.user.id;

        const currentUser = await User.findById(currentUserId);
        const targetFriend = await User.findById(friendId);

        if (!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Remover de la lista del usuario actual
        currentUser.friends = currentUser.friends.filter(
            (id) => id.toString() !== friendId
        );
        await currentUser.save();

        // Remover también del perfil del amigo (relación bidireccional)
        if (targetFriend) {
            targetFriend.friends = targetFriend.friends.filter(
                (id) => id.toString() !== currentUserId
            );
            await targetFriend.save();
        }

        return res.json({ message: 'Amigo eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};