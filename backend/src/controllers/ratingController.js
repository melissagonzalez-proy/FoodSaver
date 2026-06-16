import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Blacklist from "../models/Blacklist.js";
import Rating from "../models/Rating.js";
import User from "../models/User.js";
import { evaluateUserReputation } from "../services/reputationService.js";

/* 
  CREAR CALIFICACIÓN Y ACTUALIZAR PROMEDIO
*/
export const rateUser = async (req, res) => {
  try {
    const { donationId, toUserId, score, comentario } = req.body;
    const fromUserId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ message: "Donacion invalida." });
    }
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({ message: "Usuario a calificar invalido." });
    }
    const scoreNumber = Number(score);
    if (!Number.isFinite(scoreNumber) || scoreNumber < 0 || scoreNumber > 5) {
      return res
        .status(400)
        .json({ message: "La calificacion debe estar entre 0 y 5." });
    }
    if (fromUserId === toUserId) {
      return res
        .status(400)
        .json({ message: "No puedes calificarte a ti mismo." });
    }

    const donation = await Donation.findById(donationId);
    if (!donation || donation.estado !== "recolectado") {
      return res
        .status(400)
        .json({ message: "Solo puedes calificar donaciones completadas." });
    }

    if (!donation.donor || !donation.beneficiary) {
      return res
        .status(400)
        .json({
          message: "La donacion no tiene usuarios validos para calificar.",
        });
    }

    const donorId = donation.donor.toString();
    const beneficiaryId = donation.beneficiary.toString();
    const fromId = fromUserId.toString();
    const toId = toUserId.toString();

    if (fromId === toId) {
      return res.status(400).json({ message: "No puedes calificarte a ti mismo." });
    }
    const validPair =
      (fromId === donorId && toId === beneficiaryId) ||
      (fromId === beneficiaryId && toId === donorId);
    if (!validPair) {
      return res
        .status(403)
        .json({ message: "No estas autorizado para calificar esta donacion." });
    }

    const newRating = new Rating({
      donationId,
      fromUser: fromUserId,
      toUser: toUserId,
      score: scoreNumber,
      comentario,
    });
    await newRating.save();

    const allRatings = await Rating.find({ toUser: toUserId });
    const totalScore = allRatings.reduce((acc, curr) => acc + curr.score, 0);
    const newAverage = totalScore / allRatings.length;

    await User.findByIdAndUpdate(toUserId, {
      promedioCalificacion: parseFloat(newAverage.toFixed(1)),
      totalEvaluaciones: allRatings.length,
    });

    await evaluateUserReputation({
      userId: toUserId,
      average: parseFloat(newAverage.toFixed(1)),
    });

    res.status(201).json({ message: "Calificación enviada con éxito." });
  } catch (error) {
    console.error("error", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Ya has calificado esta transacción." });
    }
    res.status(500).json({ message: "Error al guardar calificación." });
  }
};

/* 
  LISTAR USUARIOS ORDENADOS (PARA EL ADMIN)
*/
export const getUsersForAdminRating = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $match: { role: { $ne: "admin" }, isBlacklisted: { $ne: true } },
      },
      {
        $addFields: {
          hasRatings: { $cond: [{ $gt: ["$totalEvaluaciones", 0] }, 1, 0] },
        },
      },
      {
        $sort: {
          hasRatings: -1,
          promedioCalificacion: 1,
          totalEvaluaciones: 1,
        },
      },
      {
        $project: { password: 0 },
      },
    ]);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la lista de usuarios." });
  }
};

/* 
  ELIMINAR USUARIO CON MALA CALIFICACIÓN
*/
export const deleteBadUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });

    if (user.isBlacklisted) {
      return res.status(400).json({
        message: "El usuario ya se encuentra en lista negra.",
      });
    }

    if (user.promedioCalificacion > 3 || user.totalEvaluaciones === 0) {
      return res
        .status(400)
        .json({
          message:
            "El usuario no cumple con el criterio de mala calificación (<= 3).",
        });
    }

    if (user.role === "donor") {
      await Donation.updateMany(
        { donor: userId, estado: "activo" },
        { estado: "cancelado" },
      );
      await Donation.updateMany(
        { donor: userId, estado: "asignado" },
        { estado: "cancelado", beneficiary: null },
      );
    } else {
      await Donation.updateMany(
        { beneficiary: userId, estado: "asignado" },
        { estado: "activo", beneficiary: null, pickupPin: null },
      );
    }

    const blacklistFilters = [{ email: user.email }];
    if (user.numeroDocumento) {
      blacklistFilters.push({ numeroDocumento: user.numeroDocumento });
    }
    if (user.nit) {
      blacklistFilters.push({ nit: user.nit });
    }

    const existingBlacklist = await Blacklist.findOne({
      $or: blacklistFilters,
    });
    if (!existingBlacklist) {
      await Blacklist.create({
        email: user.email,
        numeroDocumento: user.numeroDocumento || null,
        nit: user.nit || null,
        userId: user._id,
      });
    }

    user.isBlacklisted = true;
    user.blacklistedAt = new Date();
    user.isSuspended = true;
    await user.save();

    res.status(200).json({
      message:
        "Usuario bloqueado y agregado a la lista negra. Operaciones canceladas.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }

};

/* OBTENER PERFIL PÚBLICO DE USUARIO */
export const getUserPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    // Perfil sin datos sensibles
    const user = await User.findById(userId).select(
      "nombres apellidos nombreEmpresa ciudad direccion role promedioCalificacion totalEvaluaciones createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Calificaciones recibidas, con datos básicos del emisor
    const ratings = await Rating.find({ toUser: userId })
      .populate("fromUser", "nombres apellidos nombreEmpresa role")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ user, ratings });
  } catch (error) {
    console.error("Error al obtener perfil público:", error);
    res.status(500).json({ message: "Error al obtener el perfil." });
  }
};