import React, { useState } from 'react';
import { X, Star, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { apiUrl } from '../../../lib/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationId: string;
  toUserId: string; 
  toUserName: string; 
  onSuccess: () => void;
}

export const RatingModal = ({ isOpen, onClose, donationId, toUserId, toUserName, onSuccess }: RatingModalProps) => {
  const [score, setScore] = useState<number>(-1);
  const [hoveredScore, setHoveredScore] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const token = localStorage.getItem("token");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 0) {
      setError("Por favor selecciona una calificación de 0 a 5 estrellas.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      await axios.post(apiUrl('/api/ratings/rate'), {
        donationId,
        toUserId,
        score,
        comentario
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess(); 
        onClose();   
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al enviar la calificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-card w-full max-w-md rounded-3xl shadow-2xl border border-brand-border overflow-hidden flex flex-col relative scale-in-95">
        
        {showSuccess ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-brand-text mb-2">¡Gracias por evaluar!</h3>
            <p className="text-brand-muted">Tu calificación ayuda a mantener una comunidad segura y confiable.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-border">
              <h2 className="text-xl font-semibold text-brand-text font-jakarta">Evaluar Experiencia</h2>
              <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-background rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm flex items-center gap-2 font-medium">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="text-center mb-6">
                <p className="text-sm text-brand-muted mb-1">¿Cómo te fue con</p>
                <p className="text-lg font-bold text-brand-text">{toUserName}?</p>
              </div>

              <form id="rating-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* ESTRELLAS INTERACTIVAS */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setScore(0)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      score === 0
                        ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-500"
                        : "bg-brand-background border-brand-border text-brand-muted hover:text-brand-text"
                    }`}
                  >
                    0
                  </button>
                  <span className="text-xs text-brand-muted">Sin estrellas</span>
                </div>

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
                        className={`${
                          star <= (hoveredScore || score)
                            ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                            : "text-brand-muted/30"
                        } transition-all duration-200`}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center h-4">
                  <span className="text-sm font-medium text-brand-accent">
                    {score === 0 && "Sin estrellas"}
                    {score === 1 && "Mala"}
                    {score === 2 && "Regular"}
                    {score === 3 && "Buena"}
                    {score === 4 && "Muy Buena"}
                    {score === 5 && "¡Excelente!"}
                    {score < 0 && "Selecciona una calificacion"}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-brand-muted">Comentarios (Opcional)</label>
                  <textarea 
                    placeholder="Escribe cómo fue tu experiencia..." 
                    value={comentario} 
                    onChange={(e) => setComentario(e.target.value)} 
                    className="w-full bg-brand-background border border-brand-border rounded-xl px-4 py-3 text-brand-text outline-none focus:border-brand-accent min-h-[100px] resize-none" 
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-brand-border bg-brand-background/50 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 font-medium text-brand-text border border-brand-border rounded-xl hover:bg-brand-background transition-colors">
                Cancelar
              </button>
              <button type="submit" form="rating-form" disabled={isSubmitting || score < 0} className="flex-1 py-3 font-medium text-white bg-brand-accent rounded-xl hover:bg-brand-accent-light disabled:opacity-50 transition-all shadow-lg shadow-brand-accent/20">
                {isSubmitting ? "Enviando..." : "Calificar"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};