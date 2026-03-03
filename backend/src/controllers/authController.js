import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
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

    if (!/^\d{9,10}$/.test(cedula))
      return res
        .status(400)
        .json({ message: "La cédula debe ser de 9 o 10 dígitos" });
    if (!/^\d{10}$/.test(celular))
      return res
        .status(400)
        .json({ message: "El celular debe tener 10 dígitos" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Email inválido" });
    if (!/^(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password))
      return res
        .status(400)
        .json({
          message:
            "La contraseña requiere al menos 1 número decimal y 1 carácter especial",
        });

    const userExists = await User.findOne({ $or: [{ email }, { cedula }] });
    if (userExists)
      return res
        .status(400)
        .json({ message: "El usuario ya existe con este correo o cédula" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      cedula,
      nombres,
      apellidos,
      departamento,
      ciudad,
      direccion,
      email,
      celular,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "Cuenta ha sido creada con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Por favor, ingresa tu email y contraseña." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: { id: user._id, nombres: user.nombres, email: user.email },
    });
  } catch (error) {
    console.error("Error en el controlador de login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
