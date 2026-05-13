import nodemailer from "nodemailer";

let cachedTransporter;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailService = process.env.EMAIL_SERVICE || "Gmail";

  if (!emailUser || !emailPass) {
    throw new Error("Faltan EMAIL_USER o EMAIL_PASS para enviar correos.");
  }

  cachedTransporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return cachedTransporter;
};

export const sendDonationInterestEmail = async ({
  to,
  donorName,
  beneficiaryName,
  foodName,
  dashboardUrl,
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const subject = `FoodSaver - Nuevo interesado en ${foodName}`;
  const text =
    `Hola ${donorName},\n\n` +
    `${beneficiaryName} solicitó tu publicación "${foodName}".\n` +
    `Coordina la entrega aquí: ${dashboardUrl}\n\n` +
    "Gracias por apoyar a la comunidad.\n";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>Hola ${donorName},</p>
      <p>
        <strong>${beneficiaryName}</strong> solicitó tu publicación
        <strong>"${foodName}"</strong>.
      </p>
      <p>
        Puedes coordinar la entrega desde
        <a href="${dashboardUrl}" target="_blank" rel="noreferrer">Mis Publicaciones</a>.
      </p>
      <p>Gracias por apoyar a la comunidad.</p>
    </div>
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

export const sendReputationWarningEmail = async ({
  to,
  userName,
  average,
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const subject = "FoodSaver - Tu promedio ha bajado";
  const text =
    `Hola ${userName},\n\n` +
    `Tu promedio actual es ${average}. Esto ubica tu perfil en estado amarillo.\n` +
    "Te invitamos a revisar los comentarios para mejorar tu reputación.\n\n" +
    "Gracias por ser parte de la comunidad FoodSaver.\n";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>Hola ${userName},</p>
      <p>
        Tu promedio actual es <strong>${average}</strong>. Esto ubica tu perfil
        en estado <strong>amarillo</strong>.
      </p>
      <p>Te invitamos a revisar los comentarios para mejorar tu reputación.</p>
      <p>Gracias por ser parte de la comunidad FoodSaver.</p>
    </div>
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

export const sendReputationProbationEmail = async ({
  to,
  userName,
  average,
  probationEnd,
  commentsUrl,
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const probationDate = probationEnd
    ? new Date(probationEnd).toLocaleDateString("es-CO")
    : "";

  const subject = "FoodSaver - Periodo de prueba activado";
  const text =
    `Hola ${userName},\n\n` +
    `Tu promedio actual es ${average}. Tu cuenta entra en periodo de prueba por 15 días.\n` +
    (probationDate
      ? `Este periodo finaliza el ${probationDate}.\n`
      : "") +
    `Revisa tus comentarios aquí: ${commentsUrl}\n\n` +
    "Gracias por apoyar a la comunidad.\n";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>Hola ${userName},</p>
      <p>
        Tu promedio actual es <strong>${average}</strong>. Tu cuenta entra en
        <strong>periodo de prueba</strong> por 15 días.
      </p>
      ${
        probationDate
          ? `<p>Este periodo finaliza el <strong>${probationDate}</strong>.</p>`
          : ""
      }
      <p>
        Revisa tus comentarios aquí:
        <a href="${commentsUrl}" target="_blank" rel="noreferrer">Ver comentarios</a>.
      </p>
      <p>Gracias por apoyar a la comunidad.</p>
    </div>
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};

export const sendAdminReviewMessageEmail = async ({
  to,
  userName,
  message,
  commentsUrl,
}) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const subject = "FoodSaver - Revisión de comentarios";
  const text =
    `Hola ${userName},\n\n` +
    `${message}\n\n` +
    (commentsUrl ? `Revisa tus comentarios: ${commentsUrl}\n\n` : "") +
    "Equipo FoodSaver.\n";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <p>Hola ${userName},</p>
      <p>${message}</p>
      ${
        commentsUrl
          ? `<p>Revisa tus comentarios aquí: <a href="${commentsUrl}" target="_blank" rel="noreferrer">Ver comentarios</a>.</p>`
          : ""
      }
      <p>Equipo FoodSaver.</p>
    </div>
  `;

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
