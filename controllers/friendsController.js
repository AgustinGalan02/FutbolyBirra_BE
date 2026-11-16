import User from '../models/user.js';
import Person from '../models/person.js';
import Notification from '../models/notification.js';
import { emitToUser } from '../socket.js';

// Obtener amigos y solicitudes pendientes de la Persona logueada
export const getFriendsData = async (req, res) => {
    try {
        const currentPersonId = req.user.personId;
        const person = await Person.findById(currentPersonId)
            .populate('friends', 'nombre apellido team')
            .populate('friendRequests.from', 'nombre apellido team');

        if (!person) {
            return res.status(404).json({ message: 'Perfil de persona no encontrado' });
        }

        // Enriquecer con username desde User para mantener compatibilidad en la UI
        const friendIds = person.friends.map((f) => f._id);
        const requesterIds = person.friendRequests.map((r) => r.from?._id).filter(Boolean);
        const allPersonIds = [...friendIds, ...requesterIds];

        const usersMap = await User.find({ person: { $in: allPersonIds } }).select('person username');
        const usernameByPersonId = new Map(
            usersMap.map((u) => [u.person.toString(), u.username])
        );

        const friendsFormatted = person.friends.map((f) => ({
            _id: f._id,
            username: usernameByPersonId.get(f._id.toString()) || `${f.nombre} ${f.apellido}`.trim(),
            team: f.team
        }));

        const requestsFormatted = person.friendRequests
            .filter((r) => r.from)
            .map((r) => ({
                _id: r._id,
                createdAt: r.createdAt,
                from: {
                    _id: r.from._id,
                    username: usernameByPersonId.get(r.from._id.toString()) || `${r.from.nombre} ${r.from.apellido}`.trim(),
                    team: r.from.team
                }
            }));

        return res.json({
            friends: friendsFormatted,
            friendRequests: requestsFormatted
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Enviar solicitud de amistad a otra Persona (buscada por su username público)
export const sendFriendRequest = async (req, res) => {
    try {
        const { targetUsername } = req.params;
        const currentPersonId = req.user.personId;

        const targetUser = await User.findOne({ username: targetUsername });
        if (!targetUser || !targetUser.person) {
            return res.status(404).json({ message: 'Usuario destinatario no encontrado' });
        }

        const targetPersonId = targetUser.person.toString();

        if (targetPersonId === String(currentPersonId)) {
            return res.status(400).json({ message: 'No podés enviarte una solicitud a vos mismo' });
        }

        const targetPerson = await Person.findById(targetPersonId);
        if (!targetPerson) {
            return res.status(404).json({ message: 'Perfil destinatario no encontrado' });
        }

        if (targetPerson.friends.some((id) => id.toString() === String(currentPersonId))) {
            return res.status(400).json({ message: 'Ya son amigos' });
        }

        const alreadyRequested = targetPerson.friendRequests.some(
            (r) => r.from.toString() === String(currentPersonId)
        );

        if (alreadyRequested) {
            return res.status(400).json({ message: 'Ya enviaste una solicitud a esta persona' });
        }

        targetPerson.friendRequests.push({ from: currentPersonId });
        await targetPerson.save();

        const notif = await Notification.create({
            recipient: targetUser._id,
            sender: req.user.id,
            type: 'friend_request'
        });

        emitToUser(targetUser._id, 'new_notification', {
            ...notif.toObject(),
            sender: { _id: req.user.id, username: req.user.username }
        });

        return res.json({ message: 'Solicitud de amistad enviada con éxito' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Aceptar solicitud de amistad (senderId es el personId del remitente)
export const acceptFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const currentPersonId = req.user.personId;

        const currentPerson = await Person.findById(currentPersonId);
        const senderPerson = await Person.findById(senderId);

        if (!currentPerson || !senderPerson) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        const requestIndex = currentPerson.friendRequests.findIndex(
            (r) => r.from.toString() === senderId
        );

        if (requestIndex === -1) {
            return res.status(400).json({ message: 'No hay ninguna solicitud de esta persona' });
        }

        currentPerson.friendRequests.splice(requestIndex, 1);

        if (!currentPerson.friends.some((id) => id.toString() === senderId)) {
            currentPerson.friends.push(senderId);
        }
        if (!senderPerson.friends.some((id) => id.toString() === String(currentPersonId))) {
            senderPerson.friends.push(currentPersonId);
        }

        await currentPerson.save();
        await senderPerson.save();

        return res.json({ message: 'Solicitud aceptada correctamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Rechazar solicitud de amistad
export const rejectFriendRequest = async (req, res) => {
    try {
        const { senderId } = req.params;
        const currentPersonId = req.user.personId;

        const currentPerson = await Person.findById(currentPersonId);
        if (!currentPerson) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        currentPerson.friendRequests = currentPerson.friendRequests.filter(
            (r) => r.from.toString() !== senderId
        );

        await currentPerson.save();

        return res.json({ message: 'Solicitud rechazada' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar a un amigo de la lista
export const removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const currentPersonId = req.user.personId;

        const currentPerson = await Person.findById(currentPersonId);
        const targetFriend = await Person.findById(friendId);

        if (!currentPerson) {
            return res.status(404).json({ message: 'Persona no encontrada' });
        }

        currentPerson.friends = currentPerson.friends.filter(
            (id) => id.toString() !== friendId
        );
        await currentPerson.save();

        if (targetFriend) {
            targetFriend.friends = targetFriend.friends.filter(
                (id) => id.toString() !== String(currentPersonId)
            );
            await targetFriend.save();
        }

        return res.json({ message: 'Amigo eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};