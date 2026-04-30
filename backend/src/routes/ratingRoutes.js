import express from "express";
import { rateUser } from "../controllers/ratingController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/rate", authenticate, rateUser);

export default router;
