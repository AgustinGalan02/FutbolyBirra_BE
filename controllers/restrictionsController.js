import AccessRestriction from '../models/AccessRestriction.js';

export const getRestrictions = async (req, res) => {
    try {
        const userOrigin = req.user.username;
        const restrictions = await AccessRestriction.find({ userOrigin });
        return res.json(restrictions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const createRestriction = async (req, res) => {
    try {
        const userOrigin = req.user.username;
        const { userTarget, tipoRestriccion } = req.body;

        if (userOrigin === userTarget) {
            return res.status(400).json({ message: 'No puedes aplicarte restricciones a ti mismo' });
        }

        const exists = await AccessRestriction.findOne({ userOrigin, userTarget });
        if (exists) {
            return res.status(400).json({ message: 'La restricción ya existe' });
        }

        const restriction = new AccessRestriction({
            userOrigin,
            userTarget,
            tipoRestriccion: tipoRestriccion || 'BLOQUEO'
        });

        await restriction.save();
        return res.status(201).json({ message: `Restricción aplicada a ${userTarget}` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const removeRestriction = async (req, res) => {
    try {
        const userOrigin = req.user.username;
        const { userTarget } = req.params;

        const removed = await AccessRestriction.findOneAndDelete({ userOrigin, userTarget });
        if (!removed) {
            return res.status(404).json({ message: 'Restricción no encontrada' });
        }

        return res.json({ message: `Restricción removida para ${userTarget}` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};