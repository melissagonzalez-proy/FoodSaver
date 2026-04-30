import express from "express";
import {
  getPendingBeneficiaries,
  approveBeneficiary,
  rejectBeneficiary,
} from "../controllers/adminController.js";
import {
  getUsersForAdminRating,
  deleteBadUser,
} from "../controllers/ratingController.js";

const router = express.Router();

router.get("/pending-beneficiaries", getPendingBeneficiaries);
router.put("/approve-beneficiary/:id", approveBeneficiary);
router.delete("/reject-beneficiary/:id", rejectBeneficiary);
router.get("/users-ratings", getUsersForAdminRating);
router.delete("/delete-bad-user/:userId", deleteBadUser);

export default router;
