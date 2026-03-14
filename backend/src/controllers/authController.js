import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

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
