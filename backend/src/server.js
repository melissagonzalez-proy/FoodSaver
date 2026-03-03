import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor de FoodSaver corriendo en el puerto ${PORT}`);
});
