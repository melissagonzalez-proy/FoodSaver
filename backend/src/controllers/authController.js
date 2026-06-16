import axios from "axios";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Blacklist from "../models/Blacklist.js";
import User from "../models/User.js";

dotenv.config();

const splitNombreCompleto = (nombreCompleto = "") => {
  const partes = nombreCompleto.trim().split(" ");

  if (partes.length === 1) {
    return {
      nombres: partes[0],
      apellidos: "",
    };
  }

  return {
    nombres: partes.slice(0, -2).join(" ") || partes[0],
    apellidos: partes.slice(-2).join(" "),
  };
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const isBlacklistedCandidate = async ({ email, numeroDocumento, nit }) => {
  const filters = [];
  const emailValue = normalizeEmail(email);
  if (emailValue) filters.push({ email: emailValue });
  if (numeroDocumento) filters.push({ numeroDocumento });
  if (nit) filters.push({ nit });
  if (filters.length === 0) return false;

  const [blacklistEntry, blacklistedUser] = await Promise.all([
    Blacklist.findOne({ $or: filters }),
    User.findOne({ isBlacklisted: true, $or: filters }),
  ]);

  return Boolean(blacklistEntry || blacklistedUser);
};
/* =====================================================
   DONADOR — PRE REGISTRO (NIT + ENVÍO OTP)
===================================================== */
export const preRegisterDonorWithValidation = async (req, res) => {
  try {
    const {
      nombreEmpresa,
      nit,
      nombreEncargado,
      email,
      password,
      celular,
      departamento,
      ciudad,
      direccion,
    } = req.body;

    const isBlacklisted = await isBlacklistedCandidate({ email, nit });
    if (isBlacklisted) {
      return res.status(403).json({
        message: "No es posible registrar este usuario.",
      });
    }

    // Verificar si ya existe el usuario
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    // ─── PASO 1: Validar NIT primero ───────────────────────────
    const nitRes = await axios.post(
      process.env.N8N_NIT_WEBHOOK,
      { nit, nombreEmpresa },
      { timeout: 60000 },
    );

    if (!nitRes.data || nitRes.data.aprobado !== true) {
      return res.status(400).json({
        nitValid: false,
        message: "NIT no aprobado",
        detalle: nitRes.data?.mensaje,
      });
    }

    // ─── PASO 2: Solo si NIT es válido, enviar OTP por email ───
    const otpRes = await axios.post(
      process.env.N8N_PHONE_WEBHOOK,
      { email, nombre: nombreEncargado },  // 👈 email + nombre en vez de celular
      { timeout: 60000 },
    );

    return res.status(200).json({
      nitValid: true,
      otpSent: otpRes.data?.success === true,
      razonSocial: nitRes.data.razonSocial,
    });

  } catch (error) {
    console.error(
      "❌ Error en preRegister:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      message: "Error validando con n8n",
    });
  }
};

/* =====================================================
   DONADOR — VERIFICAR OTP Y CREAR CUENTA
===================================================== */
export const verifyDonorOtpAndCreate = async (req, res) => {
  try {
    const { donorData } = req.body;
    const otp = req.body.otp || req.body.http;

    const isBlacklisted = await isBlacklistedCandidate({
      email: donorData?.email,
      nit: donorData?.nit,
    });
    if (isBlacklisted) {
      return res.status(403).json({
        message: "No es posible registrar este usuario.",
      });
    }

    // Verificar OTP en n8n (ahora con email en vez de celular)
    const otpRes = await axios.post(
      process.env.N8N_VERIFY_OTP_WEBHOOK,
      {
        email: donorData.email,  // 👈 email en vez de celular
        otp,
      },
      { timeout: 60000 },
    );

    const otpResult = Array.isArray(otpRes.data) ? otpRes.data[0] : otpRes.data;

    console.log("OTP RESULT:", otpResult);

    if (!otpResult || otpResult.success !== true) {
      return res.status(400).json({
        message: "OTP inválido o expirado",
        reason: otpResult?.reason,
      });
    }

    // Verificar nuevamente que no exista el usuario
    const exists = await User.findOne({ email: donorData.email });
    if (exists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    // Crear donador
    const hashedPassword = await bcrypt.hash(donorData.password, 10);

    const newDonor = new User({
      role: "donor",
      nombreEmpresa: donorData.nombreEmpresa,
      nit: donorData.nit,
      nombres: donorData.nombreEncargado,
      apellidos: "",
      email: donorData.email,
      password: hashedPassword,
      celular: donorData.celular,
      departamento: donorData.departamento,
      ciudad: donorData.ciudad,
      direccion: donorData.direccion,
      phoneVerified: true,
      nitVerified: true,
    });

    await newDonor.save();

    return res.status(201).json({
      message: "Donador registrado con éxito",
      userId: newDonor._id,
    });

  } catch (error) {
    console.error(
      "❌ Error en verify OTP:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      message: "Error creando el donador",
    });
  }
};

/* =====================================================
   BENEFICIARIO — PRE REGISTRO (SISBÉN + ENVÍO OTP)
===================================================== */
export const preRegisterBeneficiaryWithValidation = async (req, res) => {
  try {
    const {
      numeroDocumento,
      tipoDocumento,
      nombre,
      sisbenGrupo,
      municipio,
      celular,
      email,
      password,
      departamento,
      ciudad,
      direccion,
    } = req.body;

    const isBlacklisted = await isBlacklistedCandidate({
      email,
      numeroDocumento,
    });
    if (isBlacklisted) {
      return res.status(403).json({
        message: "No es posible registrar este usuario.",
      });
    }

    console.log("numero documento", numeroDocumento, "sisben", sisbenGrupo);

    // Verificar si ya existe el usuario
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "El correo ya está registrado",
      });
    }

    // ─── PASO 1: Validar SISBÉN primero ────────────────────────
    const sisbenRes = await axios.post(
      process.env.N8N_SISBEN_WEBHOOK,
      {
        numeroDocumento,
        tipoDocumento,
        nombre,
        sisbenGrupo,
        municipio,
      },
      { timeout: 60000 },
    );

    if (!sisbenRes.data || sisbenRes.data.aprobado !== true) {
      console.log(
        "!sisbenRes.data || sisbenRes.data.aprobado !== true",
        sisbenRes.data,
        sisbenRes.data.aprobado !== true,
      );
      return res.status(400).json({
        sisbenValid: false,
        message: "SISBÉN no válido",
      });
    }

    // ─── PASO 2: Solo si SISBÉN es válido, enviar OTP por email ─
    const otpRes = await axios.post(
      process.env.N8N_PHONE_WEBHOOK,
      { email, nombre },
      { timeout: 60000 },
    );

    return res.status(200).json({
      sisbenValid: true,
      otpSent: otpRes.data?.success === true,
    });

  } catch (error) {
    console.error("❌ Error preRegisterBeneficiary:", error);
    return res.status(500).json({
      message: "Error validando beneficiario",
    });
  }
};

/* =====================================================
   BENEFICIARIO — VERIFICAR OTP Y CREAR CUENTA
===================================================== */
export const verifyBeneficiaryOtpAndCreate = async (req, res) => {
  try {
    const { beneficiaryData, otp } = req.body;

    if (!beneficiaryData || !otp) {
      return res.status(400).json({
        message: "Información incompleta",
      });
    }

    const isBlacklisted = await isBlacklistedCandidate({
      email: beneficiaryData?.email,
      numeroDocumento: beneficiaryData?.numeroDocumento,
    });
    if (isBlacklisted) {
      return res.status(403).json({
        message: "No es posible registrar este usuario.",
      });
    }

    // Verificar OTP en n8n 
    const otpRes = await axios.post(
      process.env.N8N_VERIFY_OTP_WEBHOOK,
      {
        email: beneficiaryData.email,
        otp,
      },
      { timeout: 60000 },
    );

    const otpResult = Array.isArray(otpRes.data) ? otpRes.data[0] : otpRes.data;

    if (!otpResult || otpResult.success !== true) {
      return res.status(400).json({
        message: "OTP inválido o expirado",
      });
    }

    const hashedPassword = await bcrypt.hash(beneficiaryData.password, 10);

    const newUser = new User({
      role: "beneficiary",
      nombres: beneficiaryData.nombres,
      apellidos: beneficiaryData.apellidos,
      email: beneficiaryData.email,
      password: hashedPassword,
      celular: beneficiaryData.celular,
      departamento: beneficiaryData.departamento,
      ciudad: beneficiaryData.ciudad,
      direccion: beneficiaryData.direccion,
      tipoDocumento: beneficiaryData.tipoDocumento,
      numeroDocumento: beneficiaryData.numeroDocumento,
      sisbenGrupo: beneficiaryData.sisbenGrupo,
      isVerified: false,
    });

    console.log(newUser);
    await newUser.save();

    return res.status(201).json({
      message: "Beneficiario registrado correctamente",
      userId: newUser._id,
    });

  } catch (error) {
    console.error("❌ Error verifyBeneficiary:", error);
    return res.status(500).json({
      message: "Error creando beneficiario",
    });
  }
};

/* =====================================================
   BENEFICIARIO — SUBIDA DE DOCUMENTOS (PASO FINAL)
===================================================== */
export const registerBeneficiary = async (req, res) => {
  try {
    // 1. Recibimos el ID del usuario que se acaba de crear en el paso anterior
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "ID de usuario no proporcionado.",
      });
    }

    // 2. Extraemos las rutas de los archivos que Multer guardó
    const documentoIdentidadUrl = req.files?.["documentoIdentidad"]?.[0]?.path;
    const sisbenUrl = req.files?.["sisben"]?.[0]?.path;

    if (!documentoIdentidadUrl || !sisbenUrl) {
      return res.status(400).json({
        message:
          "Debes adjuntar ambos documentos requeridos (Documento y SISBÉN).",
      });
    }

    // 3. Buscamos al usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado en la base de datos.",
      });
    }

    // 4. Actualizamos el usuario agregándole los documentos
    user.documentoIdentidadUrl = documentoIdentidadUrl;
    user.sisbenUrl = sisbenUrl;

    await user.save();

    res.status(200).json({
      message:
        "Documentos subidos con éxito. En espera de verificación del administrador.",
    });
  } catch (error) {
    console.error("Error en subida de documentos de beneficiario:", error);
    res.status(500).json({
      message: "Error en el servidor al guardar los documentos.",
    });
  }
};

/* =====================================================
   LOGIN (SIN CAMBIOS)
===================================================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isBlacklisted = await isBlacklistedCandidate({ email });
    if (isBlacklisted) {
      return res.status(403).json({
        message: "Tu cuenta está en lista negra.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({
        message: "Tu cuenta está en lista negra.",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: "Tu cuenta está suspendida. Contacta con soporte.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secreto_temporal_foodsaver",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id.toString(),
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
        nombreEmpresa: user.nombreEmpresa,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error en el servidor al intentar iniciar sesión.",
    });
  }
};

/* =====================================================
   RECUPERACIÓN DE CONTRASEÑA (SIN CAMBIOS)
===================================================== */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No existe un usuario con ese correo.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: user.email,
      subject: "FoodSaver - Recuperación de Contraseña",
      html: `<a href="${resetUrl}">Restablecer contraseña</a>`,
    });

    res.status(200).json({
      message: "Correo enviado. Revisa tu bandeja de entrada.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({
      message: "Error al intentar enviar el correo.",
    });
  }
};

/* =====================================================
   RESET PASSWORD (SIN CAMBIOS)
===================================================== */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "El enlace es inválido o ha expirado.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      message: "Contraseña actualizada con éxito.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al restablecer la contraseña.",
    });
  }
};

/* =====================================================
   CHANGE PASSWORD (SIN CAMBIOS)
===================================================== */
export const changePassword = async (req, res) => {
  try {
    const { userId, passwordActual, passwordNueva } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado.",
      });
    }

    const isMatch = await bcrypt.compare(passwordActual, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "La contraseña actual es incorrecta.",
      });
    }

    user.password = await bcrypt.hash(passwordNueva, 10);
    await user.save();

    res.status(200).json({
      message: "Tu contraseña ha sido cambiada con éxito.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al cambiar la contraseña.",
    });
  }
};

/* =====================================================
   DONADOR — SUBIDA DE DOCUMENTOS (PASO FINAL)
===================================================== */
export const uploadDonorDocuments = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "ID de usuario no proporcionado." });
    }

    const rutUrl = req.files?.["rut"]?.[0]?.path;
    const camaraComercioUrl = req.files?.["camaraComercio"]?.[0]?.path;

    if (!rutUrl || !camaraComercioUrl) {
      return res.status(400).json({
        message: "Debes adjuntar el RUT y la Cámara de Comercio.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    user.rutUrl = rutUrl;
    user.camaraComercioUrl = camaraComercioUrl;
    await user.save();

    res.status(200).json({
      message: "Documentos de la empresa subidos con éxito.",
    });
  } catch (error) {
    console.error("Error en subida de documentos de donador:", error);
    res.status(500).json({
      message: "Error en el servidor al guardar los documentos.",
    });
  }
};

/* 
  ACTUALIZAR PERFIL 
*/
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombres, apellidos, departamento, ciudad, direccion, celular } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    if (nombres) user.nombres = nombres;
    if (apellidos) user.apellidos = apellidos;
    if (departamento) user.departamento = departamento;
    if (ciudad) user.ciudad = ciudad;
    if (direccion) user.direccion = direccion;
    if (celular) user.celular = celular;

    await user.save();

    res.status(200).json({ 
      message: "Perfil actualizado con éxito.",
      user: {
        id: user._id.toString(),
        nombres: user.nombres,
        apellidos: user.apellidos,
        departamento: user.departamento,
        ciudad: user.ciudad,
        direccion: user.direccion,
        celular: user.celular,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ message: "Error interno al actualizar el perfil." });
  }
};
