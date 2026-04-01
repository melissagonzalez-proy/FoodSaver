import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    beneficiary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    titulo: { type: String, required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: String, required: true },
    fechaCaducidad: { type: Date, required: true },

    estado: {
      type: String,
      enum: ["activo", "asignado", "recolectado"],
      default: "activo",
    },

    imagenUrl: { type: String, required: false },
  },
  { timestamps: true },
);

export default mongoose.model("Donation", donationSchema);
