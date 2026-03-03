import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    cedula: { type: String, required: true, unique: true },
    nombres: { type: String, required: true },
    apellidos: { type: String, required: true },
    departamento: { type: String, required: true },
    ciudad: { type: String, required: true },
    direccion: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    celular: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
