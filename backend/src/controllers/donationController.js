import Donation from "../models/Donation.js";

export const createDonation = async (req, res) => {
  try {
    const { donorId, titulo, descripcion, cantidad, fechaCaducidad } = req.body;

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

export const getDonorDonations = async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).sort({
      createdAt: -1,
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error al obtener donaciones:", error);
    res.status(500).json({ message: "Error al obtener tus publicaciones." });
  }
};

export const getAvailableDonations = async (req, res) => {
  try {
    const availableDonations = await Donation.find({ estado: "activo" })
      .populate(
        "donor",
        "nombres apellidos departamento ciudad direccion celular",
      )
      .sort({ createdAt: -1 });

    res.status(200).json(availableDonations);
  } catch (error) {
    console.error("Error al obtener la galería de alimentos:", error);
    res
      .status(500)
      .json({ message: "Error al cargar los alimentos disponibles." });
  }
};

export const requestDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { beneficiaryId } = req.body;

    const activeRequest = await Donation.findOne({
      beneficiary: beneficiaryId,
      estado: "asignado",
    });

    if (activeRequest) {
      return res.status(400).json({
        message:
          "Ya tienes una reserva activa. Debes recolectarla antes de pedir otra.",
      });
    }

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        estado: "asignado",
        beneficiary: beneficiaryId,
      },
      { new: true },
    );

    res.status(200).json({ message: "Reserva realizada con éxito", donation });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la reserva." });
  }
};

export const cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      {
        estado: "activo",
        beneficiary: null,
      },
      { new: true },
    );

    res
      .status(200)
      .json({
        message: "Donación liberada y vuelve a estar activa.",
        donation,
      });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar la donación." });
  }
};

export const completeDonation = async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await Donation.findByIdAndUpdate(
      id,
      { estado: "recolectado" },
      { new: true },
    );

    res
      .status(200)
      .json({ message: "¡Alimento entregado con éxito!", donation });
  } catch (error) {
    res.status(500).json({ message: "Error al finalizar la entrega." });
  }
};
