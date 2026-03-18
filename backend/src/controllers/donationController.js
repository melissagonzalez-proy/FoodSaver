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

// 4. CANCELAR DONACIÓN (HU-008)
export const cancelDonation = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID de la donación a cancelar
    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({ message: "Donación no encontrada." });
    }

    if (donation.estado === "reservado") {
      // Si estaba reservado, lo "liberamos" volviéndolo a poner disponible
      donation.estado = "disponible";
      await donation.save();
      return res.status(200).json({ 
        message: "Reserva cancelada, el producto vuelve a estar disponible.", 
        donation 
      });
    } else if (donation.estado === "disponible") {
      // Si nadie lo ha pedido, simplemente lo borramos
      await Donation.findByIdAndDelete(id);
      return res.status(200).json({ message: "Publicación eliminada con éxito." });
    } else {
      // Si ya está "entregado", no se puede cancelar
      return res.status(400).json({ message: "No se puede cancelar un producto que ya fue recolectado." });
    }
  } catch (error) {
    console.error("Error al cancelar la donación:", error);
    res.status(500).json({ message: "Error en el servidor al cancelar." });
  }
};

// 5. RESERVAR UN ALIMENTO (HU-010)
export const reserveDonation = async (req, res) => {
  try {
    const { id } = req.params; // ID de la donación que se quiere reservar
    const { beneficiaryId } = req.body; // ID del beneficiario que hace clic

    // CRITERIO 4: Evitar acaparamiento. 
    // Buscamos si este beneficiario ya tiene algo "reservado"
    const activeReservation = await Donation.findOne({
      beneficiary: beneficiaryId,
      estado: "reservado"
    });

    if (activeReservation) {
      return res.status(400).json({ 
        message: "Ya tienes una solicitud activa. Recoge tu alimento actual antes de solicitar otro." 
      });
    }

    // Buscamos el alimento
    const donation = await Donation.findById(id);
    
    // CRITERIO 3 (Implícito): Verificar que nadie más se lo haya llevado en el último segundo
    if (!donation || donation.estado !== "disponible") {
      return res.status(400).json({ message: "Lo sentimos, este alimento ya fue reservado por alguien más." });
    }

    // CRITERIO 2: Cambiar el estado a "Asignado" y guardamos al beneficiario
    donation.estado = "reservado";
    donation.beneficiary = beneficiaryId;
    await donation.save();

    res.status(200).json({ message: "¡Alimento reservado con éxito!", donation });
  } catch (error) {
    console.error("Error al reservar:", error);
    res.status(500).json({ message: "Error en el servidor al intentar reservar." });
  }
};
