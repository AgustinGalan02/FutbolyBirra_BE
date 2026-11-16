import AccessRestriction from '../models/accessRestriction.js';
import User from '../models/user.js';

// Obtener restricciones emitidas o recibidas por la Persona autenticada
export const getRestrictions = async (req, res) => {
    try {
        const personOrigin = req.user.personId;
        const restrictions = await AccessRestriction.find({ personOrigin, activa: true })
            .populate('personTarget', 'nombre apellido team');

        return res.json(restrictions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Auditar Historial de Reincidencia (CU-07.2)
export const auditReincidencia = async (req, res) => {
    try {
        const { personTarget } = req.params;

        const sancionesPrevias = await AccessRestriction.find({
            personTarget,
            tipoRestriccion: { $in: ['ADVERTENCIA', 'SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'] }
        }).sort({ createdAt: -1 });

        const cantidadFaltas = sancionesPrevias.length;
        let nivelReincidencia = 'PRIMERA_INFRACCION';
        let sancionSugerida = 'ADVERTENCIA';

        if (cantidadFaltas === 1) {
            nivelReincidencia = 'REINCIDENTE_LEVE';
            sancionSugerida = 'SUSPENSION_TEMPORAL';
        } else if (cantidadFaltas >= 2) {
            nivelReincidencia = 'REINCIDENTE_CRITICO';
            sancionSugerida = 'BANEO_PERMANENTE';
        }

        return res.json({
            personTarget,
            cantidadFaltas,
            nivelReincidencia,
            sancionSugerida,
            historial: sancionesPrevias
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Crear bloqueo entre personas o aplicar sanción disciplinaria
export const createRestriction = async (req, res) => {
    try {
        const personOrigin = req.user.personId;
        const { personTarget, tipoRestriccion, motivo, diasSuspension, reportOrigin } = req.body;

        if (!personTarget) {
            return res.status(400).json({ message: 'Debe especificar la persona destino' });
        }

        if (String(personOrigin) === String(personTarget)) {
            return res.status(400).json({ message: 'No puedes aplicarte restricciones a ti mismo' });
        }

        const tipo = tipoRestriccion || 'BLOQUEO';

        // Si es un bloqueo personal entre usuarios, evitar duplicados activos
        if (tipo === 'BLOQUEO') {
            const exists = await AccessRestriction.findOne({
                personOrigin,
                personTarget,
                tipoRestriccion: 'BLOQUEO',
                activa: true
            });
            if (exists) {
                return res.status(400).json({ message: 'El bloqueo ya existe' });
            }
        }

        // Calcular fechaFin si corresponde a una suspensión temporal
        let fechaFin = null;
        if (tipo === 'SUSPENSION_TEMPORAL' && diasSuspension) {
            fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + Number(diasSuspension));
        }

        const restriction = new AccessRestriction({
            personOrigin,
            personTarget,
            reportOrigin: reportOrigin || null,
            tipoRestriccion: tipo,
            motivo: motivo || '',
            fechaFin,
            activa: true
        });

        await restriction.save();

        // Si es BANEO_PERMANENTE, revocar acceso en el módulo de seguridad (User)
        if (tipo === 'BANEO_PERMANENTE') {
            await User.findOneAndUpdate({ person: personTarget }, { active: false });
        }

        return res.status(201).json({
            message: 'Restricción aplicada correctamente',
            restriction
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Levantar / remover bloqueo o restricción
export const removeRestriction = async (req, res) => {
    try {
        const personOrigin = req.user.personId;
        const { personTarget } = req.params;

        const removed = await AccessRestriction.findOneAndUpdate(
            { personOrigin, personTarget, activa: true },
            { activa: false },
            { new: true }
        );

        if (!removed) {
            return res.status(404).json({ message: 'Restricción no encontrada' });
        }

        return res.json({ message: 'Restricción removida correctamente' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};