import express from "express";
import {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
  cancelDonation,
  reserveDonation,
} from "../controllers/donationController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Galería general para beneficiarios
router.get("/available", getAvailableDonations);

// Historial específico para un donador
router.get("/donor/:donorId", getDonorDonations);

// Usamos upload.single('imagen') porque el donador solo subirá 1 foto por publicación
router.post("/", upload.single("imagen"), createDonation);

// Ruta para que el beneficiario reserve (HU-010)
router.put("/:id/reserve", reserveDonation);

// Historial específico para un donador
router.delete("/:id/cancel", cancelDonation);

export default router;
