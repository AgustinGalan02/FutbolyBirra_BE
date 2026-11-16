import Report from '../models/report.js';
import AccessRestriction from '../models/accessRestriction.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import Message from '../models/message.js';

// Crear una nueva denuncia
export const createReport = async (req, res) => {
    try {
        const personEmisor = req.user.personId;
        const { personInfractor, tipoContenido, idContenido, motivo, observaciones } = req.body;

        if (!personEmisor) {
            return res.status(400).json({ message: 'No se pudo identificar la persona emisora en la sesión.' });
        }

        if (!personInfractor || !tipoContenido || !idContenido || !motivo) {
            return res.status(400).json({
                message: 'Faltan campos obligatorios: personInfractor, tipoContenido, idContenido y motivo.'
            });
        }

        if (String(personEmisor) === String(personInfractor)) {
            return res.status(400).json({ message: 'No podés denunciarte a vos mismo.' });
        }

        // Evitar reportes duplicados pendientes del mismo emisor sobre el mismo contenido
        const existingReport = await Report.findOne({
            personEmisor,
            idContenido,
            estado: 'PENDIENTE'
        });

        if (existingReport) {
            return res.status(400).json({ message: 'Ya realizaste una denuncia pendiente sobre este contenido.' });
        }

        const newReport = new Report({
            personEmisor,
            personInfractor,
            tipoContenido,
            idContenido,
            motivo,
            observaciones: observaciones || ''
        });

        const savedReport = await newReport.save();

        return res.status(201).json({
            message: 'Denuncia registrada correctamente',
            report: savedReport
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getPendingReports = async (req, res) => {
    try {
        const reports = await Report.find({ estado: 'PENDIENTE' })
            .populate('personEmisor', 'nombre apellido team')
            .populate('personInfractor', 'nombre apellido team')
            .sort({ createdAt: -1 })
            .lean();

        const personIds = new Set();
        reports.forEach((r) => {
            if (r.personEmisor?._id) personIds.add(r.personEmisor._id.toString());
            if (r.personInfractor?._id) personIds.add(r.personInfractor._id.toString());
        });

        const users = await User.find({ person: { $in: [...personIds] } }).select('person username');
        const usernameMap = new Map(users.map((u) => [u.person.toString(), u.username]));

        const enrichedReports = await Promise.all(
            reports.map(async (report) => {
                const infractorId = report.personInfractor?._id?.toString();
                const emisorId = report.personEmisor?._id?.toString();

                // Auditoria rapida de antecedentes
                const cantidadFaltas = infractorId
                    ? await AccessRestriction.countDocuments({
                          personTarget: infractorId,
                          tipoRestriccion: { $in: ['ADVERTENCIA', 'SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'] }
                      })
                    : 0;

                return {
                    ...report,
                    emisorUsername: emisorId ? usernameMap.get(emisorId) || 'Desconocido' : 'Desconocido',
                    infractorUsername: infractorId ? usernameMap.get(infractorId) || 'Desconocido' : 'Desconocido',
                    cantidadFaltasPrevias: cantidadFaltas
                };
            })
        );

        return res.json(enrichedReports);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Resolver denuncia aplicando sancion
export const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const personModerador = req.user.personId;
        const { tipoRestriccion, motivo, diasSuspension, ocultarContenido } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Denuncia no encontrada.' });
        }

        if (report.estado !== 'PENDIENTE') {
            return res.status(400).json({ message: `La denuncia ya fue procesada (Estado actual: ${report.estado}).` });
        }

        const tiposValidos = ['ADVERTENCIA', 'SUSPENSION_TEMPORAL', 'BANEO_PERMANENTE'];
        if (!tiposValidos.includes(tipoRestriccion)) {
            return res.status(400).json({
                message: 'Tipo de sanción inválido. Debe ser ADVERTENCIA, SUSPENSION_TEMPORAL o BANEO_PERMANENTE.'
            });
        }

        // Calcular fechaFin si corresponde a suspensión temporal
        let fechaFin = null;
        if (tipoRestriccion === 'SUSPENSION_TEMPORAL') {
            const dias = Number(diasSuspension) || 7;
            fechaFin = new Date();
            fechaFin.setDate(fechaFin.getDate() + dias);
        }

        // 1. Registrar la sanción vinculada a las personas
        const nuevaSancion = new AccessRestriction({
            personOrigin: personModerador,
            personTarget: report.personInfractor,
            reportOrigin: report._id,
            tipoRestriccion,
            motivo: motivo || report.motivo,
            fechaFin,
            activa: true
        });
        await nuevaSancion.save();

        // 2. Si es BANEO_PERMANENTE, revocar credenciales
        if (tipoRestriccion === 'BANEO_PERMANENTE') {
            await User.findOneAndUpdate({ person: report.personInfractor }, { active: false });
        }

        // 3. Opcionalmente eliminar/ocultar el contenido denunciado
        if (ocultarContenido) {
            if (report.tipoContenido === 'PUBLICACION') {
                await Post.findByIdAndDelete(report.idContenido);
            } else if (report.tipoContenido === 'MENSAJE_PRIVADO') {
                await Message.findByIdAndDelete(report.idContenido);
            }
        }

        // 4. Actualizar estado del reporte
        report.estado = 'RESUELTO';
        report.notaResolucion = motivo || `Sanción aplicada: ${tipoRestriccion}`;
        report.fechaResolucion = new Date();
        await report.save();

        return res.json({
            message: 'Denuncia resuelta y sanción aplicada correctamente',
            report,
            sancion: nuevaSancion
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Desestimar denuncia sin aplicar sancion
export const dismissReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { notaResolucion } = req.body;

        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: 'Denuncia no encontrada.' });
        }

        if (report.estado !== 'PENDIENTE') {
            return res.status(400).json({ message: `La denuncia ya fue procesada (Estado actual: ${report.estado}).` });
        }

        report.estado = 'DESESTIMADO';
        report.notaResolucion = notaResolucion || 'Denuncia desestimada por el moderador.';
        report.fechaResolucion = new Date();
        await report.save();

        return res.json({
            message: 'Denuncia desestimada correctamente',
            report
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};