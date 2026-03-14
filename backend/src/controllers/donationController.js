import Donation from "../models/Donation.js";

// 1. Crear una nueva publicación de alimento
export const createDonation = async (req, res) => {
  try {
    const { donorId, titulo, descripcion, cantidad, fechaCaducidad } = req.body;

    // Si el donador subió una foto, guardamos la ruta
    const imagenUrl = req.file ? req.file.path : null;

    const newDonation = new Donation({
      donor: donorId,
      titulo,
      descripcion,
      cantidad,
      fechaCaducidad,
      imagenUrl,
    });

    await newDonation.save();
    res
      .status(201)
      .json({ message: "Publicación creada con éxito", donation: newDonation });
  } catch (error) {
    console.error("Error al crear donación:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al publicar el alimento." });
  }
};

// 2. Obtener las publicaciones de un donador específico
export const getDonorDonations = async (req, res) => {
  try {
    const { donorId } = req.params;
    // Buscamos las donaciones y las ordenamos de la más nueva a la más vieja
    const donations = await Donation.find({ donor: donorId }).sort({
      createdAt: -1,
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    res.status(500).json({ message: "Error al obtener tus publicaciones." });
  }
};

// 3. OBTENER GALERÍA DE ALIMENTOS DISPONIBLES (Para el Beneficiario)
export const getAvailableDonations = async (req, res) => {
  try {
    // Buscamos solo los disponibles y "poblamos" los datos del donador
    const availableDonations = await Donation.find({ estado: "disponible" })
      .populate(
        "donor",
        "nombres apellidos departamento ciudad direccion celular",
      )
      .sort({ createdAt: -1 }); // Los más recientes primero

    res.status(200).json(availableDonations);
  } catch (error) {
    console.error("Error al obtener la galería de alimentos:", error);
    res
      .status(500)
      .json({ message: "Error al cargar los alimentos disponibles." });
  }
};
