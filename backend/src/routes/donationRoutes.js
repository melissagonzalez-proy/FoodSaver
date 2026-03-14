import express from "express";
import {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
} from "../controllers/donationController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Galería general para beneficiarios
router.get("/available", getAvailableDonations);

// Historial específico para un donador
router.get("/donor/:donorId", getDonorDonations);

// Usamos upload.single('imagen') porque el donador solo subirá 1 foto por publicación
router.post("/", upload.single("imagen"), createDonation);

export default router;
