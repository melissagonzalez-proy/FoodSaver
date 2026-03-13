import User from "../models/User.js";

// 1. Obtener la lista de beneficiarios pendientes
export const getPendingBeneficiaries = async (req, res) => {
  try {
    // Buscamos usuarios que sean beneficiarios y que aún no estén verificados
    const pendingUsers = await User.find({
      role: "beneficiary",
      isVerified: false,
    });
    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res
      .status(500)
      .json({ message: "Error al obtener las solicitudes pendientes." });
  }
};

// 2. Aprobar a un beneficiario
export const approveBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndUpdate(id, { isVerified: true });
    res.status(200).json({ message: "Beneficiario aprobado con éxito." });
  } catch (error) {
    res.status(500).json({ message: "Error al aprobar al usuario." });
  }
};

// 3. Rechazar (eliminar) a un beneficiario
export const rejectBeneficiary = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Solicitud rechazada y eliminada." });
  } catch (error) {
    res.status(500).json({ message: "Error al rechazar al usuario." });
  }
};
