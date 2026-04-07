import Donation from "../models/Donation.js";

// 1. CREAR DONACIÓN
export const createDonation = async (req, res) => {
  try {
    const { donorId, titulo, descripcion, cantidad, unidad, fechaCaducidad } = req.body;
    const imagenUrl = req.file ? req.file.path : null;

    const newDonation = new Donation({
      donor: donorId,
      titulo,
      descripcion,
      cantidad: Number(cantidad),
      unidad: unidad || "unidades",
      fechaCaducidad,
      imagenUrl,
    });

    await newDonation.save();
    res.status(201).json({ message: "Publicación creada con éxito", donation: newDonation });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor al publicar el alimento." });
  }
};

// 2. OBTENER DONACIONES DEL DONADOR (Para sus tarjetas)
export const getDonorDonations = async (req, res) => {
  try {
    const { donorId } = req.params;
    const donations = await Donation.find({ donor: donorId }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tus publicaciones." });
  }
};

// 3. OBTENER GALERÍA PARA BENEFICIARIOS (¡La que se había borrado!)
export const getAvailableDonations = async (req, res) => {
  try {
    const availableDonations = await Donation.find({ estado: "activo" })
      .populate("donor", "nombres apellidos nombreEmpresa departamento ciudad direccion celular")
      .sort({ createdAt: -1 });
    res.status(200).json(availableDonations);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar los alimentos disponibles." });
  }
};

// 4. SOLICITAR DONACIÓN (Con anti-acaparamiento, PIN y Fraccionamiento)
export const requestDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { beneficiaryId, cantidadSolicitada } = req.body;

    // Regla Anti-Acaparamiento
    const activeRequest = await Donation.findOne({
      beneficiary: beneficiaryId,
      estado: "asignado",
    });

    if (activeRequest) {
      return res.status(400).json({ message: "Ya tienes una reserva activa. Debes recolectarla antes de pedir otra." });
    }

    const donationOriginal = await Donation.findById(id);
    if (!donationOriginal || donationOriginal.estado !== "activo") {
      return res.status(400).json({ message: "Alimento no disponible." });
    }

    // Si el frontend no manda cantidad (por ahora), asume que se lleva todo
    const cantSolicitada = cantidadSolicitada ? Number(cantidadSolicitada) : donationOriginal.cantidad;

    // CASO A: Se lleva TODO lo que hay
    if (cantSolicitada >= donationOriginal.cantidad) {
      const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
      donationOriginal.estado = "asignado";
      donationOriginal.beneficiary = beneficiaryId;
      donationOriginal.pickupPin = generatedPin;
      await donationOriginal.save();
      return res.status(200).json({ message: "Reserva total realizada con éxito", donation: donationOriginal });
    }

    // CASO B: FRACCIONAMIENTO (Se lleva solo una parte)
    donationOriginal.cantidad -= cantSolicitada;
    await donationOriginal.save();

    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    const newReservation = new Donation({
      donor: donationOriginal.donor,
      beneficiary: beneficiaryId,
      titulo: donationOriginal.titulo,
      descripcion: donationOriginal.descripcion,
      cantidad: cantSolicitada,
      unidad: donationOriginal.unidad,
      fechaCaducidad: donationOriginal.fechaCaducidad,
      imagenUrl: donationOriginal.imagenUrl,
      estado: "asignado",
      pickupPin: generatedPin,
      failedPinAttempts: 0
    });

    await newReservation.save();
    res.status(200).json({ 
      message: `Has reservado ${cantSolicitada}. El resto sigue disponible para otros.`, 
      donation: newReservation 
    });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la reserva." });
  }
};

// 5. CANCELAR DONACIÓN
export const cancelDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const donation = await Donation.findByIdAndUpdate(
      id,
      { estado: "activo", beneficiary: null, pickupPin: null, failedPinAttempts: 0 },
      { new: true }
    );
    res.status(200).json({ message: "Reserva cancelada y alimento liberado.", donation });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar la donación." });
  }
};

// 6. COMPLETAR ENTREGA CON PIN
export const completeDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    const donation = await Donation.findById(id);

    if (donation.failedPinAttempts >= 3) {
      return res.status(403).json({ message: "Entrega bloqueada por demasiados intentos fallidos." });
    }

    if (donation.pickupPin !== pin) {
      donation.failedPinAttempts += 1;
      await donation.save();
      return res.status(400).json({ message: `PIN incorrecto. Intentos: ${donation.failedPinAttempts}/3` });
    }

    donation.estado = "recolectado";
    donation.pickupPin = null;
    await donation.save();

    res.status(200).json({ message: "¡PIN Validado! Alimento entregado con éxito.", donation });
  } catch (error) {
    res.status(500).json({ message: "Error al finalizar la entrega." });
  }
};

// 7. OBTENER RESERVAS DE UN BENEFICIARIO (Pestaña "Mis Reservas")
export const getBeneficiaryDonations = async (req, res) => {
  try {
    const { beneficiaryId } = req.params;
    const donations = await Donation.find({ beneficiary: beneficiaryId })
      .populate("donor", "nombreEmpresa nombres apellidos direccion celular ciudad")
      .sort({ updatedAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: "Error al cargar tus reservas." });
  }
};

// 8. OBTENER HISTORIAL DE UN DONANTE (Pestaña "Historial")
export const getDonorHistory = async (req, res) => {
  try {
    const { donorId } = req.params;
    const history = await Donation.find({ donor: donorId })
      .populate("beneficiary", "nombres apellidos email")
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial." });
  }
};

// 9. OBTENER TODAS LAS DONACIONES (Para el Administrador)
export const getAllDonationsAdmin = async (req, res) => {
  try {
    // Buscamos absolutamente todas las donaciones y traemos info del donador y beneficiario
    const allDonations = await Donation.find()
      .populate("donor", "nombres apellidos nombreEmpresa email")
      .populate("beneficiary", "nombres apellidos email")
      .sort({ createdAt: -1 }); // Las más recientes primero

    res.status(200).json(allDonations);
  } catch (error) {
    console.error("Error al obtener todas las donaciones para admin:", error);
    res.status(500).json({ message: "Error al cargar el panel general." });
  }
};