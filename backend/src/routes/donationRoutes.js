import express from "express";
import {
  createDonation,
  getDonorDonations,
  getAvailableDonations,
  requestDonation,
  cancelDonation,
  completeDonation,
} from "../controllers/donationController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("imagen"), createDonation);
router.get("/available", getAvailableDonations);
router.get("/donor/:donorId", getDonorDonations);
router.put("/request/:id", requestDonation);
router.put("/cancel/:id", cancelDonation);
router.put("/complete/:id", completeDonation);

export default router;
