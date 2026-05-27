import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Star,
  MapPin,
  Calendar,
  MessageSquare,
  Send,
} from "lucide-react";
import { apiUrl } from "../../../lib/api";
import { FeedbackDialog } from "@/components/ui/feedback-dialog";

interface RatingAuthor {
  _id: string;
  nombres?: string;
  apellidos?: string;
  nombreEmpresa?: string;
  role: string;
}

interface Rating {
  _id: string;
  score: number;
  comentario?: string;
  createdAt: string;
  fromUser: RatingAuthor;
}

interface UserProfile {
  _id: string;
  nombres?: string;
  apellidos?: string;
  nombreEmpresa?: string;
  ciudad?: string;
  direccion?: string;
  role: string;
  promedioCalificacion: number;
  totalEvaluaciones: number;
  createdAt: string;
}

interface AdminReviewModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onMessageSent: () => void;
}

export const AdminReviewModal = ({
  isOpen,
  userId,
  onClose,
  onMessageSent,
}: AdminReviewModalProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState({
    open: false,
    title: "",
    message: "",
    tone: "info" as "info" | "success" | "error",
  });
  const token = localStorage.getItem("token");

  const showFeedback = (
    tone: "info" | "success" | "error",
    title: string,
    message = "",
  ) => {
    setFeedback({ open: true, title, message, tone });
  };

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(`/api/ratings/profile/${userId}`));
      setProfile(response.data.user);
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      setMessage("");
      fetchProfile();
    }
  }, [isOpen, fetchProfile]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await axios.post(
        apiUrl(`/api/admin/trial-users/${userId}/message`),
        { message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onMessageSent();
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      showFeedback(
        "error",
        "No se pudo enviar",
        "Ocurrio un error al enviar el mensaje.",
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const displayName =
    profile?.nombreEmpresa ||
    `${profile?.nombres ?? ""} ${profile?.apellidos ?? ""}`.trim();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-brand-card w-full max-w-2xl rounded-3xl shadow-2xl border border-brand-border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
          <div>
            <h3 className="text-xl font-bold text-brand-text font-jakarta">
              Revision de Comentarios
            </h3>
            <p className="text-xs text-brand-muted">
              {displayName || "Usuario"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-background transition-colors flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="text-center py-10 text-brand-muted">Cargando...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-background border border-brand-border/60 rounded-2xl p-4">
                  <p className="text-xs text-brand-muted">Ubicacion</p>
                  <div className="flex items-center gap-2 text-sm text-brand-text mt-2">
                    <MapPin size={14} className="text-brand-accent" />
                    <span>
                      {profile?.direccion ? `${profile?.direccion}, ` : ""}
                      {profile?.ciudad || "Sin ciudad"}
                    </span>
                  </div>
                </div>
                <div className="bg-brand-background border border-brand-border/60 rounded-2xl p-4">
                  <p className="text-xs text-brand-muted">Antiguedad</p>
                  <div className="flex items-center gap-2 text-sm text-brand-text mt-2">
                    <Calendar size={14} className="text-brand-accent" />
                    <span>
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("es-CO", {
                            month: "long",
                            year: "numeric",
                          })
                        : "-"}
                    </span>
                  </div>
                </div>
                <div className="bg-brand-background border border-brand-border/60 rounded-2xl p-4">
                  <p className="text-xs text-brand-muted">Evaluacion</p>
                  <div className="flex items-center gap-2 text-sm text-brand-text mt-2">
                    <Star size={14} className="text-yellow-500" />
                    <span>
                      {profile ? profile.promedioCalificacion.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-brand-muted">
                      ({profile?.totalEvaluaciones || 0} eval.)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={16} className="text-brand-accent" />
                  <h4 className="text-sm font-semibold text-brand-text">
                    Comentarios recibidos
                  </h4>
                </div>
                {ratings.length === 0 ? (
                  <div className="text-sm text-brand-muted">Sin comentarios.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {ratings.map((rating) => (
                      <div
                        key={rating._id}
                        className="bg-brand-background border border-brand-border/60 rounded-2xl p-4"
                      >
                        <div className="flex items-center justify-between text-xs text-brand-muted">
                          <span>
                            {rating.fromUser?.nombreEmpresa ||
                              `${rating.fromUser?.nombres ?? ""} ${rating.fromUser?.apellidos ?? ""}`.trim() ||
                              "Usuario"}
                          </span>
                          <span>
                            {new Date(rating.createdAt).toLocaleDateString("es-CO")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-brand-text">
                          <Star size={14} className="text-yellow-500" />
                          <span className="font-semibold">{rating.score}</span>
                        </div>
                        {rating.comentario ? (
                          <p className="text-sm text-brand-muted mt-2">
                            {rating.comentario}
                          </p>
                        ) : (
                          <p className="text-xs text-brand-muted mt-2 italic">
                            Sin comentario adicional.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-brand-border p-6">
          <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Enviar mensaje
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            placeholder="Escribe una recomendacion o alerta para el usuario..."
            className="w-full mt-2 bg-brand-background border border-brand-border rounded-2xl p-3 text-sm text-brand-text outline-none focus:border-brand-accent transition-colors resize-none"
          />
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !message.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-light disabled:opacity-50"
            >
              <Send size={16} />
              {isSending ? "Enviando..." : "Enviar mensaje"}
            </button>
          </div>
        </div>
        </div>
      </div>

      <FeedbackDialog
        open={feedback.open}
        onOpenChange={(open) => setFeedback((prev) => ({ ...prev, open }))}
        title={feedback.title}
        message={feedback.message}
        tone={feedback.tone}
      />
    </>
  );
};
