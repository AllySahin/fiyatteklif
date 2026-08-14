import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = Number(process.env.MAIL_SERVER_PORT || 8787);
const SMTP_HOST = process.env.SMTP_SERVER || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.EMAIL_ADDRESS;
const SMTP_PASS = process.env.EMAIL_PASSWORD;
const SMTP_SECURE = SMTP_PORT === 465;
const SMTP_FROM = process.env.EMAIL_FROM || SMTP_USER;

// Validate required environment variables
if (!SMTP_USER || !SMTP_PASS) {
  console.error('ERROR: EMAIL_ADDRESS and EMAIL_PASSWORD must be set in .env file');
  process.exit(1);
}

const createTransportConfigs = () => {
  const primary = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    requireTLS: !SMTP_SECURE,
    tls: { minVersion: 'TLSv1.2' }
  };

  const fallback = SMTP_PORT === 587
    ? {
        host: SMTP_HOST,
        port: 465,
        secure: true,
        requireTLS: false,
        tls: { minVersion: 'TLSv1.2' }
      }
    : {
        host: SMTP_HOST,
        port: 587,
        secure: false,
        requireTLS: true,
        tls: { minVersion: 'TLSv1.2' }
      };

  return [primary, fallback];
};

const sendWithFallback = async (mailOptions) => {
  const configs = createTransportConfigs();
  let lastError;

  for (const cfg of configs) {
    try {
      const transporter = nodemailer.createTransport({
        ...cfg,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      return await transporter.sendMail(mailOptions);
    } catch (err) {
      lastError = err;
      const isSocketTlsError = err?.code === 'ESOCKET' || String(err?.message || '').toLowerCase().includes('wrong version number');
      if (!isSocketTlsError) break;
    }
  }

  throw lastError;
};

app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mail-server' });
});

app.post('/api/send-quote-email', async (req, res) => {
  try {
    const { to, subject, text, attachment } = req.body || {};

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: 'Sunucu SMTP ayarlari eksik.' });
    }

    if (!to || !subject || !text || !attachment?.contentBase64) {
      return res.status(400).json({ error: 'Mail alani veya ek bilgisi eksik.' });
    }

    const info = await sendWithFallback({
      from: SMTP_FROM,
      to,
      subject,
      text,
      attachments: [
        {
          filename: attachment.filename || 'teklif.pdf',
          content: attachment.contentBase64,
          encoding: 'base64',
          contentType: attachment.contentType || 'application/pdf'
        }
      ]
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Mail gonderim hatasi:', err);
    return res.status(500).json({ error: err?.message || 'Mail gonderimi basarisiz.' });
  }
});

app.post('/api/send-welcome-email', async (req, res) => {
  try {
    const { to, companyName } = req.body || {};

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
      return res.status(500).json({ error: 'Sunucu SMTP ayarlari eksik.' });
    }

    if (!to || !companyName) {
      return res.status(400).json({ error: 'Mail adresi veya firma adi eksik.' });
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1b365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .service-list { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .service-item { padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .service-item:last-child { border-bottom: none; }
    .service-icon { color: #ff6b00; font-weight: bold; margin-right: 8px; }
    .footer { background-color: #1b365d; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
    .cta-button { display: inline-block; background-color: #ff6b00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">VEFA EĞİTİM KURUMLARI</h1>
      <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Profesyonel Eğitim ve Belgelendirme Hizmetleri</p>
    </div>
    
    <div class="content">
      <h2 style="color: #1b365d; margin-top: 0;">Sayın ${companyName} Yetkilisi,</h2>
      
      <p>Firmamızla iletişime geçtiğiniz için teşekkür ederiz. VEFA Eğitim Kurumları olarak, sektörde uzun yıllara dayanan deneyimimizle size en kaliteli hizmeti sunmak için buradayız.</p>
      
      <div class="service-list">
        <h3 style="color: #1b365d; margin-top: 0;">HİZMETLERİMİZ:</h3>
        
        <div class="service-item">
          <span class="service-icon">✓</span>
          <strong>MEB Onaylı İş Makineleri Operatörlük Eğitimi</strong>
          <p style="margin: 5px 0 0 25px; color: #666; font-size: 14px;">Forklift, Ekskavatör, Beko Loder, Vinç, Greyder ve daha fazlası</p>
        </div>
        
        <div class="service-item">
          <span class="service-icon">✓</span>
          <strong>MYK Mesleki Yeterlilik Belgelendirme</strong>
          <p style="margin: 5px 0 0 25px; color: #666; font-size: 14px;">113 Ana Meslek ve 190 Alt Meslek Kolu</p>
        </div>
        
        <div class="service-item">
          <span class="service-icon">✓</span>
          <strong>İSG-KATİP Periyodik Muayene ve Bakım Kontrol Hizmetleri</strong>
          <p style="margin: 5px 0 0 25px; color: #666; font-size: 14px;">İş güvenliği ve ekipman kontrol hizmetleri</p>
        </div>
        
        <div class="service-item">
          <span class="service-icon">✓</span>
          <strong>Mavi Yaka İstihdam Desteği</strong>
          <p style="margin: 5px 0 0 25px; color: #666; font-size: 14px;">Kalifiye eleman temin ve istihdam danışmanlığı</p>
        </div>
      </div>
      
      <p>Tüm eğitim ve belgelendirme süreçlerimiz, ilgili bakanlıkların onaylarına sahiptir ve sektörel standartlara uygun olarak gerçekleştirilmektedir.</p>
      
      <p style="margin-top: 25px;"><strong>Size özel fiyat teklifi hazırlamak ve detaylı bilgi vermek için ekibimiz hazır bekliyor.</strong></p>
      
      <div style="text-align: center;">
        <a href="tel:+905305806626" class="cta-button">BİZİ ARAYIN</a>
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0;"><strong>VEFA Eğitim Kurumları</strong></p>
      <p style="margin: 5px 0;">📞 Tel: +90 530 580 66 26 | 📧 Email: ${SMTP_FROM}</p>
      <p style="margin: 5px 0; font-size: 11px; opacity: 0.8;">Profesyonel eğitim ve belgelendirme çözümleri</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const textContent = `
Sayın ${companyName} Yetkilisi,

Firmamızla iletişime geçtiğiniz için teşekkür ederiz. VEFA Eğitim Kurumları olarak, size en kaliteli hizmeti sunmak için buradayız.

HİZMETLERİMİZ:

✓ MEB Onaylı İş Makineleri Operatörlük Eğitimi
  (Forklift, Ekskavatör, Beko Loder, Vinç, Greyder vb.)

✓ MYK Mesleki Yeterlilik Belgelendirme
  (113 Ana Meslek ve 190 Alt Meslek Kolu)

✓ İSG-KATİP Periyodik Muayene ve Bakım Kontrol Hizmetleri

✓ Mavi Yaka İstihdam Desteği

Size özel fiyat teklifi hazırlamak ve detaylı bilgi vermek için bize ulaşabilirsiniz.

VEFA Eğitim Kurumları
Tel: +90 530 580 66 26
Email: ${SMTP_FROM}
    `.trim();

    const brosurPath = path.join(__dirname, '..', 'vefa_egitim_brosur.jpeg');
    const tanitimPath = path.join(__dirname, '..', 'vefa-egitim_tanitim.pdf');

    const info = await sendWithFallback({
      from: SMTP_FROM,
      to,
      subject: `${companyName} - VEFA Eğitim Kurumları Hizmetlerimiz`,
      text: textContent,
      html: htmlContent,
      attachments: [
        {
          filename: 'VEFA_Egitim_Brosur.jpeg',
          path: brosurPath
        },
        {
          filename: 'VEFA_Egitim_Tanitim.pdf',
          path: tanitimPath
        }
      ]
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('Tanıtım maili gönderim hatası:', err);
    return res.status(500).json({ error: err?.message || 'Mail gönderimi başarısız.' });
  }
});

app.listen(PORT, () => {
  console.log(`Mail server calisiyor: http://0.0.0.0:${PORT}`);
  console.log(`SMTP ayari: ${SMTP_HOST}:${SMTP_PORT} (secure=${SMTP_SECURE})`);
  console.log('SMTP fallback aktif: 587 STARTTLS <-> 465 SSL');
  console.log(`Gonderen adres: ${SMTP_FROM}`);
});
