import express from "express";
import {
  registerDonor,
  registerBeneficiary,
} from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Ruta normal (JSON) para donadores
router.post("/register", registerDonor);

// Nueva ruta (Multipart/form-data) para beneficiarios
// Usamos upload.fields para recibir múltiples archivos con nombres específicos
router.post(
  "/register-beneficiary",
  upload.fields([
    { name: "documentoIdentidad", maxCount: 1 },
    { name: "sisben", maxCount: 1 },
  ]),
  registerBeneficiary,
);

export default router;
