import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    canal: {
      type: String,
      enum: ["email"],
      required: true,
    },
    destinatario: {
      type: String,
      required: true,
    },
    estadoEntrega: {
      type: String,
      enum: ["enviado", "fallido"],
      required: true,
    },
    fechaHora: {
      type: Date,
      default: Date.now,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

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
    categoria: { type: String, default: "otros" },
    cantidad: { type: Number, required: true },
    unidad: { type: String, default: "unidades" },
    fechaCaducidad: { type: Date, required: true },
    fechaRecogida: { type: Date, required: true },

    estado: {
      type: String,
      enum: ["activo", "asignado", "recolectado", "cancelado"],
      default: "activo",
    },

    imagenUrl: { type: String, required: false },

    notificaciones: {
      type: [notificationSchema],
      default: [],
    },

    // El código secreto de 4 dígitos
    pickupPin: {
      type: String,
      default: null,
    },

    // Contador para bloquear intentos fallidos
    failedPinAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Donation", donationSchema);
