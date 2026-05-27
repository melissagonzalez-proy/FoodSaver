import User from "../models/User.js";
import { sendAdminReviewMessageEmail } from "../services/emailService.js";
import { getCommentsUrlForUser } from "../services/reputationService.js";

const normalizeDateParam = (value) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const buildDateRangeFilter = (startDate, endDate, fieldName) => {
  const range = {};

  const startValue = normalizeDateParam(startDate);
  const endValue = normalizeDateParam(endDate);

  if (startValue) {
    const start = new Date(startValue);
    if (!Number.isNaN(start.getTime())) {
      range.$gte = start;
    }
  }

  if (endValue) {
    const end = new Date(endValue);
    if (!Number.isNaN(end.getTime())) {
      range.$lt = end;
    }
  }

  if (Object.keys(range).length === 0) return {};
  return { [fieldName]: range };
};

// 1. Obtener la lista de beneficiarios pendientes
export const getPendingBeneficiaries = async (req, res) => {
  try {
    // Buscamos usuarios que sean beneficiarios y que aún no estén verificados
    const pendingUsers = await User.find({
      role: "beneficiary",
      isVerified: false,
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las solicitudes pendientes." });
  }
};

// 2. Aprobar a un beneficiario
export const approveBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isVerified: true });
    res.status(200).json({ message: "Beneficiario aprobado con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al aprobar al usuario." });
  }
};

// 3. Rechazar (eliminar) a un beneficiario
export const rejectBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Solicitud rechazada y eliminada." });
  } catch (error) {
    res.status(500).json({ message: "Error al rechazar al usuario." });
  }
};

/* =====================================================
   PANEL DE PERIODO DE PRUEBA
===================================================== */
export const getTrialUsers = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const dateFilter = buildDateRangeFilter(
      startDate,
      endDate,
      "reputationUpdatedAt",
    );
    const donationDateFilter = buildDateRangeFilter(
      startDate,
      endDate,
      "createdAt",
    );
    const categoryValue = normalizeDateParam(category);

    const matchStage = {
      role: { $ne: "admin" },
      isBlacklisted: { $ne: true },
      totalEvaluaciones: { $gt: 0 },
      ...dateFilter,
      $or: [
        { probationEnd: { $ne: null } },
        { promedioCalificacion: { $lte: 3 } },
      ],
    };

    const donationPipeline = [
      {
        $match: {
          $expr: {
            $or: [
              { $eq: ["$donor", "$$userId"] },
              { $eq: ["$beneficiary", "$$userId"] },
            ],
          },
        },
      },
    ];

    if (Object.keys(donationDateFilter).length > 0) {
      donationPipeline.push({ $match: donationDateFilter });
    }

    if (categoryValue) {
      donationPipeline.push({ $match: { categoria: categoryValue } });
    }

    donationPipeline.push(
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { categoria: 1, titulo: 1, createdAt: 1 } },
    );

    const users = await User.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "donations",
          let: { userId: "$_id" },
          pipeline: donationPipeline,
          as: "lastDonation",
        },
      },
      ...(categoryValue
        ? [{ $match: { lastDonation: { $ne: [] } } }]
        : []),
      {
        $addFields: {
          lastDonation: { $arrayElemAt: ["$lastDonation", 0] },
        },
      },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const now = new Date();
    const result = users
      .map((user) => {
        const probationEnd = user.probationEnd
          ? new Date(user.probationEnd)
          : user.reputationUpdatedAt
            ? new Date(
                new Date(user.reputationUpdatedAt).getTime() +
                  15 * 24 * 60 * 60 * 1000,
              )
            : null;
        const daysRemaining = probationEnd
          ? Math.max(
              0,
              Math.ceil((probationEnd.getTime() - now.getTime()) / 86400000),
            )
          : null;

        return {
          ...user,
          diasRestantes: probationEnd ? daysRemaining : null,
        };
      })
      .sort((a, b) => {
        const aDays = a.diasRestantes ?? Number.MAX_SAFE_INTEGER;
        const bDays = b.diasRestantes ?? Number.MAX_SAFE_INTEGER;
        return aDays - bDays;
      });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error al cargar periodo de prueba:", error);
    res.status(500).json({ message: "Error al cargar el periodo de prueba." });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: true },
      { new: true },
    ).select("_id isSuspended");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json({ message: "Usuario suspendido.", user });
  } catch (error) {
    res.status(500).json({ message: "Error al suspender usuario." });
  }
};

export const restoreUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isSuspended: false },
      { new: true },
    ).select("_id isSuspended");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json({ message: "Usuario restaurado.", user });
  } catch (error) {
    res.status(500).json({ message: "Error al restaurar usuario." });
  }
};

export const sendTrialReviewMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Mensaje requerido." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const commentsUrl = getCommentsUrlForUser(user);

    try {
      await sendAdminReviewMessageEmail({
        to: user.email,
        userName:
          user.nombreEmpresa || `${user.nombres} ${user.apellidos}`.trim(),
        message,
        commentsUrl,
      });
      user.reputationNotifications = user.reputationNotifications || [];
      user.reputationNotifications.push({
        tipo: "message",
        estadoEntrega: "enviado",
        fechaHora: new Date(),
        error: null,
      });
      await user.save();
      res.status(200).json({ message: "Mensaje enviado." });
    } catch (mailError) {
      user.reputationNotifications = user.reputationNotifications || [];
      user.reputationNotifications.push({
        tipo: "message",
        estadoEntrega: "fallido",
        fechaHora: new Date(),
        error:
          mailError instanceof Error
            ? mailError.message
            : "Error al enviar correo.",
      });
      await user.save();
      res.status(500).json({ message: "Error al enviar el mensaje." });
    }
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    res.status(500).json({ message: "Error al enviar el mensaje." });
  }
};
