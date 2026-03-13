import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    // Enlazamos la publicación con el usuario que la creó
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    titulo: { type: String, required: true }, // Ej: "Caja de manzanas"
    descripcion: { type: String, required: true }, // Ej: "Manzanas rojas en buen estado, 2 tienen golpes leves"
    cantidad: { type: String, required: true }, // Ej: "5 kg" o "10 porciones"
    fechaCaducidad: { type: Date, required: true },

    // Para saber si alguien ya lo pidió
    estado: {
      type: String,
      enum: ["disponible", "reservado", "entregado"],
      default: "disponible",
    },

    imagenUrl: { type: String, required: false }, // Ruta de la foto del alimento
  },
  { timestamps: true },
);

export default mongoose.model("Donation", donationSchema);
