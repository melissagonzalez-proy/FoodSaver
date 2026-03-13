import express from "express";
import {
  registerDonor,
  registerBeneficiary,
  login,
} from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Ruta normal (JSON) para donadores
router.post("/register", registerDonor);

// Ruta (Multipart/form-data) para beneficiarios con archivos
router.post(
  "/register-beneficiary",
  upload.fields([
    { name: "documentoIdentidad", maxCount: 1 },
    { name: "sisben", maxCount: 1 },
  ]),
  registerBeneficiary,
);

// Ruta para iniciar sesión
router.post("/login", login);

export default router;
