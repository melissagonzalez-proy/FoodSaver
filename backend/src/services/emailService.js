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
