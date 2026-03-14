import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // --- Campos compartidos por todos los roles ---
    nombres: { type: String, required: true },
    apellidos: { type: String, required: false },
    nombreEmpresa: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    celular: { type: String, required: false },
    departamento: { type: String, required: false },
    ciudad: { type: String, required: false },
    direccion: { type: String, required: false },

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
