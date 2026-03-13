import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerDonor = async (req, res) => {
  try {
    const {
      cedula,
      nombres,
      apellidos,
      departamento,
      ciudad,
      direccion,
      email,
      celular,
      password,
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    const newUser = new User({
      role: "donor",
      nombres,
      apellidos,
      email,
      password: hashedPassword,
      celular,
      departamento,
      ciudad,
      direccion,
      cedula,
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

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado." });
    }

    // Extraer las rutas de los archivos subidos (si existen)
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

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    // 2. Comparar la contraseña ingresada con la encriptada en la base de datos
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos." });
    }

    // 3. (Opcional pero recomendado para Beneficiarios) Verificar si están aprobados
    if (user.role === "beneficiary" && !user.isVerified) {
      return res
        .status(403)
        .json({
          message: "Tu cuenta aún está siendo verificada por un administrador.",
        });
    }

    // 4. Generar el Token de sesión (Firma digital)
    const secretKey = process.env.JWT_SECRET || "secreto_temporal_foodsaver";
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secretKey,
      { expiresIn: "1d" }, // El token expira en 1 día
    );

    // 5. Enviar la respuesta al frontend (Sin incluir la contraseña)
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        nombres: user.nombres,
        apellidos: user.apellidos,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al intentar iniciar sesión." });
  }
};
