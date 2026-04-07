import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 1. REGISTRO DE DONADOR (Con datos de Empresa)
export const registerDonor = async (req, res) => {
  try {
    const {
      nombreEmpresa,
      nit,
      nombreEncargado,
      departamento,
      ciudad,
      direccion,
      email,
      celular,
      password,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      role: "donor",
      nombreEmpresa,
      nit,
      nombres: nombreEncargado,
      apellidos: "",
      email,
      password: hashedPassword,
      celular,
      departamento,
      ciudad,
      direccion,
    });

    await newUser.save();

    res.status(201).json({
      message: "Cuenta de donador creada con éxito.",
    });
  } catch (error) {
    console.error("Error en registro de donador:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al crear la cuenta." });
  }
};

// 2. REGISTRO DE BENEFICIARIO (Con Archivos)
export const registerBeneficiary = async (req, res) => {
  try {
    const {
      tipoDocumento,
      numeroDocumento,
      nombres,
      apellidos,
      departamento,
      ciudad,
      direccion,
      email,
      celular,
      password,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    // Extraer rutas de archivos
    const documentoIdentidadUrl = req.files?.["documentoIdentidad"]
      ? req.files["documentoIdentidad"][0].path
      : null;
    const sisbenUrl = req.files?.["sisben"]
      ? req.files["sisben"][0].path
      : null;

    if (!documentoIdentidadUrl || !sisbenUrl) {
      return res
        .status(400)
        .json({ message: "Debes adjuntar ambos documentos requeridos." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      role: "beneficiary",
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      celular,
      departamento,
      ciudad,
      direccion,
      tipoDocumento,
      numeroDocumento,
      documentoIdentidadUrl,
      sisbenUrl,
    });

    await newUser.save();

    res.status(201).json({
      message:
        "Cuenta creada con éxito. En espera de verificación del administrador.",
    });
  } catch (error) {
    console.error("Error en registro de beneficiario:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al crear la cuenta." });
  }
};

// 3. INICIO DE SESIÓN (LOGIN)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    // Generar Token JWT
    const secretKey = process.env.JWT_SECRET || "secreto_temporal_foodsaver";
    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, {
      expiresIn: "1d",
    });

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
        nombreEmpresa: user.nombreEmpresa,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al intentar iniciar sesión." });
  }
};

// 4. SOLICITAR RECUPERACIÓN DE CONTRASEÑA (Olvidé mi clave)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No existe un usuario con ese correo." });
    }

    // Generar un Token aleatorio de 20 caracteres
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Guardar el token y su caducidad (1 hora) en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hora en milisegundos
    await user.save();

    // Configurar el "Cartero" (Nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Contraseña de aplicación de Gmail
      },
    });

    // Crear el link que el usuario clickeará
    // Asumimos que tu frontend corre en el puerto 5173
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "FoodSaver - Recuperación de Contraseña",
      html: `
        <h1>Has solicitado cambiar tu contraseña</h1>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña. Este enlace expira en 1 hora:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #FF0055; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Si no solicitaste esto, ignora este correo.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Correo enviado. Revisa tu bandeja de entrada." });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ message: "Error al intentar enviar el correo." });
  }
};

// 5. RESTABLECER CONTRASEÑA (Desde el link del correo)
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Buscar al usuario que tenga este token Y que no haya expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }, // $gt significa "Greater Than" (Mayor que ahora)
    });

    if (!user) {
      return res.status(400).json({ message: "El enlace es inválido o ha expirado." });
    }

    // Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Borrar el token para que no se pueda volver a usar
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada con éxito. Ya puedes iniciar sesión." });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer la contraseña." });
  }
};

// 6. CAMBIAR CONTRASEÑA ESTANDO LOGUEADO (Desde el perfil)
export const changePassword = async (req, res) => {
  try {
    const { userId, passwordActual, passwordNueva } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado." });

    // Verificar si la contraseña actual es correcta
    const isMatch = await bcrypt.compare(passwordActual, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta." });
    }

    // Encriptar y guardar la nueva
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(passwordNueva, salt);
    await user.save();

    res.status(200).json({ message: "Tu contraseña ha sido cambiada con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar la contraseña." });
  }
};
