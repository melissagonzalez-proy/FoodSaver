import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import donationRoutes from "./src/routes/donationRoutes.js";
import ratingRoutes from "./src/routes/ratingRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/ratings", ratingRoutes);

app.use((err, req, res, next) => {
  if (!err) return next();

  if (err.name === "MulterError") {
    return res.status(400).json({
      message: "Error al subir el archivo.",
      detail: err.message,
    });
  }

  return res.status(500).json({
    message: "Error interno del servidor.",
    detail: process.env.NODE_ENV === "production" ? undefined : err.message,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor de FoodSaver corriendo en el puerto ${PORT}`);
});
