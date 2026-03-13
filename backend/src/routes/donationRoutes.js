import express from "express";
import {
  createDonation,
  getDonorDonations,
} from "../controllers/donationController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Usamos upload.single('imagen') porque el donador solo subirá 1 foto por publicación
router.post("/", upload.single("imagen"), createDonation);

// Ruta para obtener lo que ha publicado un donador en específico
router.get("/donor/:donorId", getDonorDonations);

export default router;
