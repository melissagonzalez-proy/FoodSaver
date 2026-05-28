import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto_temporal_foodsaver",
    );

    const user = await User.findById(decoded.id).select(
      "role isSuspended isBlacklisted",
    );
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }
    if (user.isBlacklisted) {
      return res
        .status(403)
        .json({ message: "Tu cuenta está en lista negra." });
    }
    if (user.isSuspended) {
      return res
        .status(403)
        .json({ message: "Tu cuenta está suspendida." });
    }

    req.user = { id: user._id.toString(), role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado." });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso restringido a administradores." });
  }
  return next();
};

export const authorizeSelfOrAdmin = (req, res, next) => {
  const targetId = req.params.id || req.body.userId;
  if (!req.user || !targetId) {
    return res.status(403).json({ message: "No autorizado." });
  }

  if (req.user.role === "admin" || req.user.id === targetId) {
    return next();
  }

  return res.status(403).json({ message: "No autorizado." });
};
