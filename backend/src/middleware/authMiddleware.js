import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto_temporal_foodsaver",
    );
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalido o expirado." });
  }
};
