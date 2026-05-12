import express from "express";
import { getUserPublicProfile, rateUser } from "../controllers/ratingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/rate", authenticate, rateUser);

// Obtener perfil público + calificaciones de un usuario
router.get("/profile/:userId", getUserPublicProfile);

export default router;
