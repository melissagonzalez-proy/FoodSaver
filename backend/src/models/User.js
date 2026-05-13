import mongoose from "mongoose";

const reputationNotificationSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["warning", "probation", "final", "message"],
      required: true,
    },
    canal: {
      type: String,
      enum: ["email"],
      default: "email",
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

const userSchema = new mongoose.Schema(
  {
    // --- Campos compartidos por todos los roles ---
    nombres: { type: String, required: true },
    apellidos: { type: String, required: false },
    nombreEmpresa: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpire: { type: Date, required: false },
    celular: { type: String, required: false },
    departamento: { type: String, required: false },
    ciudad: { type: String, required: false },
    direccion: { type: String, required: false },
    rutUrl: { type: String, required: false },
    camaraComercioUrl: { type: String, required: false },
    promedioCalificacion: { type: Number, default: 0 },
    totalEvaluaciones: { type: Number, default: 0 },

    reputationStatus: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: "green",
    },
    reputationUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    reputationNotifications: {
      type: [reputationNotificationSchema],
      default: [],
    },
    probationStart: { type: Date, default: null },
    probationEnd: { type: Date, default: null },
    isSuspended: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["donor", "beneficiary", "admin"],
      required: true,
    },

    // --- Campos específicos del Donador ---
    nit: { type: String, required: false, unique: true, sparse: true },

    // --- Campos específicos del Beneficiario ---
    tipoDocumento: { type: String, required: false },
    numeroDocumento: { type: String, required: false },
    sisbenGrupo: { type: String, required: false },

    phoneVerified: {
      type: Boolean,
      default: false,
    },
    nitVerified: {
      type: Boolean,
      default: false,
    },

    // Aquí guardaremos las rutas (URLs) de los archivos cuando se suban
    documentoIdentidadUrl: { type: String, required: false },
    sisbenUrl: { type: String, required: false },

    // Estado de verificación para el beneficiario (HU-004)
    isVerified: {
      type: Boolean,
      default: function () {
        // Los admin y donadores nacen verificados, los beneficiarios deben esperar aprobación
        return this.role !== "beneficiary";
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
