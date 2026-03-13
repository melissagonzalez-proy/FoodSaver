import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import donationRoutes from "./src/routes/donationRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Hacer que la carpeta uploads sea accesible públicamente desde el navegador
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/donations", donationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor de FoodSaver corriendo en el puerto ${PORT}`);
});
