import express from "express";
import {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
  requestDonation,
  cancelDonation,
  completeDonation,
  getBeneficiaryDonations,
  getDonorHistory,
  getAllDonationsAdmin,
  updateDonation,
  getCollectedMetrics
} from "../controllers/donationController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/metrics/total-collected", getCollectedMetrics);

router.post("/", upload.single("imagen"), createDonation);
router.get("/available", getAvailableDonations);
router.get("/donor/:donorId", getDonorDonations);
router.get("/beneficiary/:beneficiaryId", getBeneficiaryDonations);
router.get("/history/:donorId", getDonorHistory);
router.put("/request/:id", requestDonation);
router.put("/cancel/:id", cancelDonation);
router.put("/complete/:id", completeDonation);
router.get("/admin/all", getAllDonationsAdmin);
router.put('/edit/:id', upload.single('imagen'), updateDonation);

export default router;
