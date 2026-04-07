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
    cantidad: { type: Number, required: true },
    unidad: { type: String, default: "unidades" }, 
    fechaCaducidad: { type: Date, required: true },

    estado: {
      type: String,
      enum: ["activo", "asignado", "recolectado"],
      default: "activo",
    },

    imagenUrl: { type: String, required: false },

    // El código secreto de 4 dígitos 
    pickupPin: { 
      type: String, 
      default: null 
    },
    
    // Contador para bloquear intentos fallidos
    failedPinAttempts: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true },
);

export default mongoose.model("Donation", donationSchema);
