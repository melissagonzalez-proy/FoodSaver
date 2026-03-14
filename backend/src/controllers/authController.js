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
    res.status(201).json({ message: "Cuenta de donador creada con éxito." });
  } catch (error) {
    console.error("Error en registro de donador:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al crear la cuenta." });
  }
};
