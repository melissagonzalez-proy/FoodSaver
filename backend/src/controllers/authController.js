import bcrypt from "bcrypt";
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
