import Rating from "../models/Rating.js";
import User from "../models/User.js";
import Donation from "../models/Donation.js"; 

/* 
  CREAR CALIFICACIÓN Y ACTUALIZAR PROMEDIO
*/
export const rateUser = async (req, res) => {
  try {
    const { donationId, toUserId, score, comentario } = req.body;
    const fromUserId = req.user.id; 

    const donation = await Donation.findById(donationId);
    if (!donation || donation.estado !== "recolectado") {
      return res.status(400).json({ message: "Solo puedes calificar donaciones completadas." });
    }

    const newRating = new Rating({
      donationId,
      fromUser: fromUserId,
      toUser: toUserId,
      score,
      comentario
    });
    await newRating.save();

    const allRatings = await Rating.find({ toUser: toUserId });
    const totalScore = allRatings.reduce((acc, curr) => acc + curr.score, 0);
    const newAverage = totalScore / allRatings.length;

    await User.findByIdAndUpdate(toUserId, {
      promedioCalificacion: parseFloat(newAverage.toFixed(1)), 
      totalEvaluaciones: allRatings.length
    });

    res.status(201).json({ message: "Calificación enviada con éxito." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Ya has calificado esta transacción." });
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
        $addFields: {
          hasRatings: { $cond: [{ $gt: ["$totalEvaluaciones", 0] }, 1, 0] }
        }
      },
      {
        $sort: { hasRatings: -1, promedioCalificacion: 1, totalEvaluaciones: 1 }
      },
      {
        $project: { password: 0 } 
      }
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
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    if (user.promedioCalificacion > 3 || user.totalEvaluaciones === 0) {
      return res.status(400).json({ message: "El usuario no cumple con el criterio de mala calificación (<= 3)." });
    }

    if (user.role === "donor") {
      await Donation.updateMany({ donor: userId, estado: "activo" }, { estado: "cancelado" });
      await Donation.updateMany({ donor: userId, estado: "asignado" }, { estado: "cancelado", beneficiary: null });
    } else {
      await Donation.updateMany({ beneficiary: userId, estado: "asignado" }, { estado: "activo", beneficiary: null, pickupPin: null });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Usuario eliminado y operaciones canceladas con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
};