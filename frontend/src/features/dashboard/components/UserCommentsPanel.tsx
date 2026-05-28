import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { apiUrl } from "../../../lib/api";
import { Badge } from "@/components/ui/badge";

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
  role: string;
  promedioCalificacion: number;
  totalEvaluaciones: number;
  createdAt: string;
}

interface UserCommentsPanelProps {
  userId: string;
  title?: string;
}

const ROLE_LABEL: Record<string, string> = {
  donor: "Donador",
  beneficiary: "Beneficiario",
  admin: "Admin",
};

export const UserCommentsPanel = ({ userId, title }: UserCommentsPanelProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get(apiUrl(`/api/ratings/profile/${userId}`));
      setProfile(response.data.user);
      setRatings(response.data.ratings || []);
    } catch (error) {
      console.error("Error cargando comentarios:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const displayName =
    profile?.nombreEmpresa ||
    `${profile?.nombres ?? ""} ${profile?.apellidos ?? ""}`.trim();

  return (
    <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-brand-text font-jakarta">
            {title || "Comentarios y Calificaciones"}
          </h3>
          <p className="text-sm text-brand-muted">
            Revisa lo que otros usuarios dicen sobre tu servicio.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-brand-muted">
          <Star size={16} className="text-yellow-500" />
          <span className="font-semibold text-brand-text">
            {profile ? profile.promedioCalificacion.toFixed(1) : "0.0"}
          </span>
          <span>• {profile?.totalEvaluaciones || 0} eval.</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-brand-muted">Cargando...</div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-10 text-brand-muted">
          Aun no tienes comentarios.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ratings.map((rating) => (
            <div
              key={rating._id}
              className="bg-brand-background border border-brand-border/60 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-brand-text">
                      {rating.fromUser?.nombreEmpresa ||
                        `${rating.fromUser?.nombres ?? ""} ${rating.fromUser?.apellidos ?? ""}`.trim() ||
                        "Usuario"}
                    </p>
                    {rating.fromUser?.role && (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-brand-border text-brand-muted uppercase"
                      >
                        {ROLE_LABEL[rating.fromUser.role] || rating.fromUser.role}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-muted mt-1">
                    <Calendar size={12} />
                    {new Date(rating.createdAt).toLocaleDateString("es-CO")}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold text-brand-text">
                    {rating.score}
                  </span>
                </div>
              </div>
              {rating.comentario ? (
                <p className="text-sm text-brand-muted mt-3 flex items-start gap-2">
                  <MessageSquare size={14} className="mt-0.5 text-brand-accent" />
                  <span>{rating.comentario}</span>
                </p>
              ) : (
                <p className="text-xs text-brand-muted mt-3 italic">
                  Sin comentario adicional.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {displayName && (
        <p className="text-xs text-brand-muted mt-6">
          Perfil: {displayName}
        </p>
      )}
    </div>
  );
};
