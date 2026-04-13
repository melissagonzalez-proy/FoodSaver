import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  preRegisterBeneficiaryWithValidation,
  preRegisterDonorWithValidation,
  registerBeneficiary,
  resetPassword,
  verifyBeneficiaryOtpAndCreate,
  verifyDonorOtpAndCreate
} from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();


// Ruta (Multipart/form-data) para beneficiarios con archivos
router.post(
  "/register-beneficiary",
  upload.fields([
    { name: "documentoIdentidad", maxCount: 1 },
    { name: "sisben", maxCount: 1 },
  ]),
  registerBeneficiary,
);

router.post(
  "/beneficiary/pre-register",
  preRegisterBeneficiaryWithValidation
);

router.post(
  "/beneficiary/verify",
  verifyBeneficiaryOtpAndCreate
);

// Ruta para iniciar sesión
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/change-password", changePassword);

router.post("/donor/pre-register", preRegisterDonorWithValidation);
router.post("/donor/verify", verifyDonorOtpAndCreate);

export default router;
