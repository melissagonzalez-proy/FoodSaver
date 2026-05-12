 
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  X, Star, CheckCircle, AlertCircle,
  MapPin, MessageSquare,
  Calendar, Package, ChevronRight,
} from "lucide-react";
import { apiUrl } from "../../../lib/api";
 
// ─── Tipos ────────────────────────────────────────────────────────────────────
 
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
 
interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  toUserId: string;
  toUserName: string;
  donationId: string;
  /** Muestra el formulario de calificación. Pasar false si ya calificó o si no aplica. */
  canRate: boolean;
}
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
const StarDisplay = ({ score, size = 14 }: { score: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= score ? "text-yellow-400 fill-yellow-400" : "text-brand-border"}
      />
    ))}
  </div>
);
 
const scoreLabel = (s: number) =>
  ["Sin estrellas", "Mala", "Regular", "Buena", "Muy buena", "¡Excelente!"][s] ?? "";
 
// ─── Componente ───────────────────────────────────────────────────────────────
 
export const UserProfileModal = ({
  isOpen,
  onClose,
  onSuccess,
  toUserId,
  toUserName,
  donationId,
  canRate,
}: UserProfileModalProps) => {
 
  // Vista activa: "profile" | "rate"
  const [view, setView] = useState<"profile" | "rate">("profile");
 
  // Datos del perfil
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
 
  // Formulario de calificación
  const [score, setScore] = useState(-1);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
 
  const token = localStorage.getItem("token");
 
  // ── Cargar perfil ──────────────────────────────────────────────────────────
 
  const fetchProfile = useCallback(async () => {
    if (!toUserId) return;
    setLoadingProfile(true);
    try {
      const res = await axios.get(apiUrl(`/api/ratings/profile/${toUserId}`));
      setProfile(res.data.user);
      setRatings(res.data.ratings);
    } catch (e) {
      console.error("Error cargando perfil:", e);
    } finally {
      setLoadingProfile(false);
    }
  }, [toUserId]);
 
  useEffect(() => {
    if (isOpen) {
      setView("profile");
      setScore(-1);
      setComentario("");
      setError("");
      setShowSuccess(false);
      fetchProfile();
    }
  }, [isOpen, fetchProfile]);
 
  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
 
  // ── Enviar calificación ────────────────────────────────────────────────────
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 0) { setError("Selecciona una calificación."); return; }
    setIsSubmitting(true);
    setError("");
    try {
      await axios.post(
        apiUrl("/api/ratings/rate"),
        { donationId, toUserId, score, comentario },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess();
        fetchProfile();       // refresca las calificaciones en el perfil
        setView("profile");   // vuelve al perfil actualizado
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar la calificación.");
    } finally {
      setIsSubmitting(false);
    }
  };
 
  if (!isOpen) return null;
 
  // ── Datos derivados ────────────────────────────────────────────────────────
 
  const displayName = profile?.nombreEmpresa
    || (profile ? `${profile.nombres ?? ""} ${profile.apellidos ?? ""}`.trim() : toUserName);
 
  const avg = profile?.promedioCalificacion ?? 0;
  const total = profile?.totalEvaluaciones ?? 0;
 
  const scoreDist = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: ratings.filter((r) => r.score === n).length,
  }));
  const maxCount = Math.max(...scoreDist.map((d) => d.count), 1);
 
  // ── Render ─────────────────────────────────────────────────────────────────
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-brand-card w-full max-w-md rounded-3xl shadow-2xl border border-brand-border flex flex-col overflow-hidden max-h-[90vh]">
 
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar inicial */}
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center font-bold text-brand-accent text-lg font-jakarta">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-brand-text font-jakarta leading-tight">{displayName}</h2>
              <p className="text-xs text-brand-muted capitalize">{profile?.role === "donor" ? "Donante" : "Beneficiario"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-background transition-colors flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
 
        {/* ── Tabs ── */}
        <div className="flex border-b border-brand-border shrink-0">
          <button
            onClick={() => setView("profile")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "profile" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-text"}`}
          >
            Perfil & Reseñas
          </button>
          {canRate && (
            <button
              onClick={() => setView("rate")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "rate" ? "text-brand-accent border-b-2 border-brand-accent" : "text-brand-muted hover:text-brand-text"}`}
            >
              Calificar
            </button>
          )}
        </div>
 
        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">
 
          {/* ════ Vista: PERFIL ════ */}
          {view === "profile" && (
            <div className="p-6 space-y-5">
 
              {loadingProfile ? (
                <div className="py-16 flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-brand-muted text-sm">Cargando perfil…</p>
                </div>
              ) : (
                <>
                  {/* Info básica */}
                  <div className="bg-brand-background rounded-2xl p-4 border border-brand-border/60 space-y-2.5 text-sm">
                    {profile?.ciudad && (
                      <div className="flex items-center gap-2 text-brand-muted">
                        <MapPin size={14} className="text-brand-accent shrink-0" />
                        <span>{profile.direccion ? `${profile.direccion}, ` : ""}{profile.ciudad}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Package size={14} className="text-brand-accent shrink-0" />
                      <span>{total} evaluación{total !== 1 ? "es" : ""}</span>
                    </div>
                    {profile?.createdAt && (
                      <div className="flex items-center gap-2 text-brand-muted">
                        <Calendar size={14} className="text-brand-accent shrink-0" />
                        <span>Miembro desde {new Date(profile.createdAt).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}</span>
                      </div>
                    )}
                  </div>
 
                  {/* Resumen calificación */}
                  <div className="bg-brand-background rounded-2xl p-4 border border-brand-border/60">
                    {total === 0 ? (
                      <div className="text-center py-4">
                        <Star size={28} className="text-brand-border mx-auto mb-2" />
                        <p className="text-brand-muted text-sm">Sin evaluaciones aún</p>
                      </div>
                    ) : (
                      <div className="flex gap-5 items-center">
                        {/* Número grande */}
                        <div className="text-center shrink-0">
                          <p className="text-5xl font-bold text-brand-text font-jakarta leading-none">{avg.toFixed(1)}</p>
                          <StarDisplay score={Math.round(avg)} size={13} />
                          <p className="text-xs text-brand-muted mt-1">{total} reseñas</p>
                        </div>
                        {/* Barras */}
                        <div className="flex-1 space-y-1.5">
                          {scoreDist.map(({ n, count }) => (
                            <div key={n} className="flex items-center gap-2 text-xs text-brand-muted">
                              <span className="w-2">{n}</span>
                              <Star size={9} className="text-yellow-400 fill-yellow-400 shrink-0" />
                              <div className="flex-1 h-1.5 bg-brand-border rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                  style={{ width: `${(count / maxCount) * 100}%` }}
                                />
                              </div>
                              <span className="w-3 text-right">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
 
                  {/* Lista de reseñas */}
                  {ratings.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-brand-accent" />
                        <h3 className="text-sm font-semibold text-brand-text">Comentarios</h3>
                      </div>
                      {ratings.map((r) => (
                        <div key={r._id} className="bg-brand-background rounded-xl p-4 border border-brand-border/60">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <StarDisplay score={r.score} size={12} />
                              <span className="text-xs font-medium text-brand-accent">{scoreLabel(r.score)}</span>
                            </div>
                            <span className="text-xs text-brand-muted">
                              {new Date(r.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          {/* Autor */}
                          <p className="text-xs text-brand-muted mb-1.5">
                            {r.fromUser?.nombreEmpresa || `${r.fromUser?.nombres ?? ""} ${r.fromUser?.apellidos ?? ""}`.trim() || "Usuario"}
                          </p>
                          {r.comentario ? (
                            <p className="text-sm text-brand-muted leading-relaxed">"{r.comentario}"</p>
                          ) : (
                            <p className="text-xs text-brand-border italic">Sin comentario</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
 
                  {/* CTA si puede calificar */}
                  {canRate && (
                    <button
                      onClick={() => setView("rate")}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-white font-medium text-sm transition-all"
                    >
                      <Star size={16} /> Calificar a {displayName} <ChevronRight size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
 
          {/* ════ Vista: CALIFICAR ════ */}
          {view === "rate" && (
            <div className="p-6">
              {showSuccess ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-brand-text mb-2">¡Gracias por evaluar!</h3>
                  <p className="text-brand-muted text-sm">Tu calificación ayuda a mantener una comunidad confiable.</p>
                </div>
              ) : (
                <form id="rate-form" onSubmit={handleSubmit} className="space-y-6">
 
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm flex items-center gap-2">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}
 
                  <div className="text-center">
                    <p className="text-sm text-brand-muted">¿Cómo te fue con</p>
                    <p className="text-lg font-bold text-brand-text">{displayName}?</p>
                  </div>
 
                  {/* 0 estrellas */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setScore(0)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${score === 0 ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500" : "bg-brand-background border-brand-border text-brand-muted hover:text-brand-text"}`}
                    >0</button>
                    <span className="text-xs text-brand-muted">Sin estrellas</span>
                  </div>
 
                  {/* Estrellas 1–5 */}
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredScore(star)}
                        onMouseLeave={() => setHoveredScore(0)}
                        onClick={() => setScore(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          size={40}
                          className={`${star <= (hoveredScore || score) ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-brand-muted/30"} transition-all duration-200`}
                        />
                      </button>
                    ))}
                  </div>
 
                  <div className="text-center h-4">
                    <span className="text-sm font-medium text-brand-accent">{scoreLabel(score < 0 ? -1 : score) || "Selecciona una calificación"}</span>
                  </div>
 
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-brand-muted">Comentarios <span className="text-brand-border font-normal">(opcional)</span></label>
                    <textarea
                      placeholder="Escribe cómo fue tu experiencia..."
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:border-brand-accent min-h-24 resize-none text-sm"
                    />
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
 
        {/* ── Footer ── */}
        {view === "rate" && !showSuccess && (
          <div className="px-6 py-4 border-t border-brand-border bg-brand-background/50 flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setView("profile")}
              className="flex-1 py-3 text-sm font-medium text-brand-muted border border-brand-border rounded-xl hover:bg-brand-background transition-colors"
            >
              Volver
            </button>
            <button
              type="submit"
              form="rate-form"
              disabled={isSubmitting || score < 0}
              className="flex-1 py-3 text-sm font-medium text-white bg-brand-accent rounded-xl hover:bg-brand-accent-light disabled:opacity-50 transition-all shadow-lg shadow-brand-accent/20"
            >
              {isSubmitting ? "Enviando…" : "Calificar"}
            </button>
          </div>
        )}
 
        {view === "profile" && !loadingProfile && (
          <div className="px-6 py-4 border-t border-brand-border shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-brand-muted hover:bg-brand-background border border-brand-border transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
 
      </div>
    </div>
  );
};