import express from "express";
import {
  getPendingBeneficiaries,
  approveBeneficiary,
  rejectBeneficiary,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/pending-beneficiaries", getPendingBeneficiaries);
router.put("/approve-beneficiary/:id", approveBeneficiary);
router.delete("/reject-beneficiary/:id", rejectBeneficiary);

export default router;
