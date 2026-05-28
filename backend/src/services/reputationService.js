import User from "../models/User.js";
import {
  sendReputationProbationExitEmail,
  sendReputationProbationEmail,
  sendReputationWarningEmail,
} from "./emailService.js";

const getStatusFromAverage = (average) => {
  if (average >= 4) return "green";
  if (average >= 3) return "yellow";
  return "red";
};

const buildCommentsUrl = (user) => {
  const baseUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
  const cleanBase = baseUrl.replace(/\/$/, "");

  if (user?.role === "donor") {
    return `${cleanBase}/dashboard-donor#comentarios`;
  }

  return `${cleanBase}/dashboard-beneficiary#comentarios`;
};

const logReputationNotification = (user, { type, status, error }) => {
  if (!user) return;
  user.reputationNotifications = user.reputationNotifications || [];
  user.reputationNotifications.push({
    tipo: type,
    estadoEntrega: status === "sent" ? "enviado" : "fallido",
    fechaHora: new Date(),
    error: error || null,
  });
};

export const evaluateUserReputation = async ({ userId, average }) => {
  const user = await User.findById(userId);
  if (!user || user.role === "admin") return;

  const safeAverage = Number.isFinite(average) ? average : user.promedioCalificacion || 0;
  const newStatus = getStatusFromAverage(safeAverage);
  const prevStatus = user.reputationStatus || "green";
  const shouldBeOnProbation = safeAverage <= 3;
  const wasOnProbation = Boolean(user.probationStart && user.probationEnd);
  const enteringProbation = shouldBeOnProbation && !wasOnProbation;
  const exitingProbation = !shouldBeOnProbation && wasOnProbation;
  const statusChanged = newStatus !== prevStatus;

  if (!statusChanged && !enteringProbation && !exitingProbation) {
    return;
  }

  const now = new Date();
  user.reputationStatus = newStatus;
  user.reputationUpdatedAt = now;

  if (shouldBeOnProbation) {
    if (!user.probationStart || !user.probationEnd) {
      const probationEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      user.probationStart = now;
      user.probationEnd = probationEnd;
    }
  } else {
    user.probationStart = null;
    user.probationEnd = null;
  }

  await user.save();

  if (exitingProbation) {
    const commentsUrl = buildCommentsUrl(user);
    try {
      await sendReputationProbationExitEmail({
        to: user.email,
        userName: user.nombreEmpresa || `${user.nombres} ${user.apellidos}`.trim() || "Usuario",
        average: safeAverage.toFixed(1),
        commentsUrl,
      });
      logReputationNotification(user, { type: "final", status: "sent" });
      await user.save();
    } catch (error) {
      logReputationNotification(user, {
        type: "final",
        status: "failed",
        error: error instanceof Error ? error.message : "Error al enviar correo.",
      });
      await user.save();
    }
  }

  if (
    statusChanged &&
    newStatus === "yellow" &&
    !shouldBeOnProbation &&
    !exitingProbation
  ) {
    try {
      await sendReputationWarningEmail({
        to: user.email,
        userName: user.nombreEmpresa || `${user.nombres} ${user.apellidos}`.trim() || "Usuario",
        average: safeAverage.toFixed(1),
      });
      logReputationNotification(user, { type: "warning", status: "sent" });
      await user.save();
    } catch (error) {
      logReputationNotification(user, {
        type: "warning",
        status: "failed",
        error: error instanceof Error ? error.message : "Error al enviar correo.",
      });
      await user.save();
    }
  }

  if (enteringProbation) {
    const commentsUrl = buildCommentsUrl(user);
    try {
      await sendReputationProbationEmail({
        to: user.email,
        userName: user.nombreEmpresa || `${user.nombres} ${user.apellidos}`.trim() || "Usuario",
        average: safeAverage.toFixed(1),
        probationEnd: user.probationEnd,
        commentsUrl,
      });
      logReputationNotification(user, { type: "probation", status: "sent" });
      await user.save();
    } catch (error) {
      logReputationNotification(user, {
        type: "probation",
        status: "failed",
        error: error instanceof Error ? error.message : "Error al enviar correo.",
      });
      await user.save();
    }
  }
};

export const getCommentsUrlForUser = (user) => buildCommentsUrl(user);
