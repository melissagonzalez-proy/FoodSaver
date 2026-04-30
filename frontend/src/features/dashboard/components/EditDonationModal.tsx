import React, { useState, useEffect } from "react";
import { X, UploadCloud, Image as ImageIcon } from "lucide-react";
import axios from "axios";
import { apiUrl } from "../../../lib/api";

interface Donation {
  _id: string;
  titulo: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  fechaCaducidad: string;
  fechaRecogida: string;
  imagenUrl?: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  donation: Donation | null;
  onSuccess: () => void;
}

export const EditDonationModal = ({
  isOpen,
  onClose,
  donation,
  onSuccess,
}: EditModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    cantidad: 0,
    unidad: "unidades",
    fechaCaducidad: "",
    fechaRecogida: "",
  });

  useEffect(() => {
    if (donation) {
      setFormData({
        titulo: donation.titulo,
        descripcion: donation.descripcion,
        cantidad: donation.cantidad,
        unidad: donation.unidad,
        fechaCaducidad: donation.fechaCaducidad
          ? donation.fechaCaducidad.split("T")[0]
          : "",
        fechaRecogida: donation.fechaRecogida
          ? donation.fechaRecogida.split("T")[0]
          : "",
      });
      setImageFile(null);
    }
  }, [donation]);

  if (!isOpen || !donation) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descripcion", formData.descripcion);
      data.append("cantidad", formData.cantidad.toString());
      data.append("unidad", formData.unidad);
      data.append("fechaCaducidad", formData.fechaCaducidad);
      data.append("fechaRecogida", formData.fechaRecogida);

      if (imageFile) {
        data.append("imagen", imageFile);
      }

      await axios.put(apiUrl(`/api/donations/edit/${donation._id}`), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al actualizar la publicación",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-brand-card w-full max-w-lg rounded-3xl shadow-2xl border border-brand-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <h2 className="text-xl font-semibold text-brand-text font-jakarta">
            Editar Publicación
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-background rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo (Scrollable) */}
        <div className="overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form
            id="edit-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-brand-muted">
                Título del Alimento
              </label>
              <input
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-brand-muted">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:border-brand-accent transition-colors min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Cantidad
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-2.5 text-brand-text outline-none focus:border-brand-accent transition-colors"
                  required
                  min="1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Unidad
                </label>
                <select
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-3 py-2.5 text-brand-text outline-none focus:border-brand-accent transition-colors"
                >
                  <option value="unidades">Unidades</option>
                  <option value="kg">Kilogramos</option>
                  <option value="litros">Litros</option>
                  <option value="porciones">Porciones</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Fecha de Caducidad
                </label>
                <input
                  type="date"
                  name="fechaCaducidad"
                  value={formData.fechaCaducidad}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-border rounded-xl px-3 py-2.5 text-brand-text outline-none focus:border-brand-accent transition-colors text-sm"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Fecha de Recogida
                </label>
                <input
                  type="date"
                  name="fechaRecogida"
                  value={formData.fechaRecogida}
                  onChange={handleChange}
                  className="w-full bg-brand-background border border-brand-accent/30 rounded-xl px-3 py-2.5 text-brand-text outline-none focus:border-brand-accent transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-sm font-medium text-brand-muted">
                Actualizar Imagen (Opcional)
              </label>
              <label className="cursor-pointer border-2 border-dashed border-brand-border hover:border-brand-accent rounded-xl p-4 flex items-center justify-center gap-3 transition-colors bg-brand-background">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && setImageFile(e.target.files[0])
                  }
                />
                {imageFile ? (
                  <ImageIcon className="text-brand-accent" />
                ) : (
                  <UploadCloud className="text-brand-muted" />
                )}
                <span className="text-sm text-brand-text font-medium truncate max-w-50">
                  {imageFile ? imageFile.name : "Seleccionar nueva imagen"}
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-border bg-brand-background/50 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 font-medium text-brand-text border border-brand-border rounded-xl hover:bg-brand-border/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="edit-form"
            disabled={loading}
            className="flex-1 py-3 font-medium text-white bg-brand-accent rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};
