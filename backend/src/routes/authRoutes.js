import express from "express";
import {
  changePassword,
  forgotPassword,
  login,
  preRegisterBeneficiaryWithValidation,
  preRegisterDonorWithValidation,
  registerBeneficiary,
  resetPassword,
  uploadDonorDocuments,
  verifyBeneficiaryOtpAndCreate,
  verifyDonorOtpAndCreate,
  updateProfile
} from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();


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

router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/change-password", changePassword);


router.post(
  "/donor/upload-docs",
  upload.fields([
    { name: "rut", maxCount: 1 },
    { name: "camaraComercio", maxCount: 1 },
  ]),
  uploadDonorDocuments,
);

router.post("/donor/pre-register", preRegisterDonorWithValidation);
router.post("/donor/verify", verifyDonorOtpAndCreate);

router.put("/profile/:id", updateProfile);

export default router;
