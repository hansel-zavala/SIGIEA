// backend/src/services/emailService.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"SIGIEA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Código de Recuperación de Contraseña - SIGIEA',
    text: `Tu código de recuperación de contraseña es: ${code}. Expirará en 15 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Has solicitado resetear tu contraseña para tu cuenta en SIGIEA.</p>
        <p>Usa el siguiente código de 6 dígitos para completar el proceso. El código expirará en 15 minutos.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; background: #f4f4f4; padding: 15px 25px; display: inline-block; border-radius: 8px; font-family: monospace; text-align: center;">
          ${code}
        </p>
        <p>Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        <p>Saludos,<br>El equipo de SIGIEA</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de reseteo enviado a ${email}`);
  } catch (error) {
    console.error(`Error enviando correo a ${email}:`, error);
  }
};