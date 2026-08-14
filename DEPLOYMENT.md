# 🚀 VPS Deployment Rehberi

## İlk Kurulum (Bir Kerelik)

### 1. VPS'e Bağlanın
```bash
ssh user@your-vps-ip
```

### 2. Node.js ve PM2 Kurulumu
```bash
# Node.js 18+ kur (Ubuntu/Debian için)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 global kur
sudo npm install -g pm2
```

### 3. Projeyi Clone Edin
```bash
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/fiyatteklif.git
cd fiyatteklif
```

### 4. Environment Variables Oluşturun
```bash
nano .env
```

İçeriği yapıştırın:
```
MAIL_SERVER_PORT=8787
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=alpaslan@vefaegitimkurumlari.com
EMAIL_PASSWORD=zlhs jsbc quxo angb
EMAIL_FROM=alpaslan@vefaegitimkurumlari.com
```

Kaydet: `Ctrl+O`, `Enter`, `Ctrl+X`

### 5. İlk Deployment
```bash
# Dependencies yükle
npm install --production

# Frontend build et
npm run build

# Mail server'ı başlat
pm2 start ecosystem.config.cjs

# Sistem başlangıcında otomatik başlat
pm2 startup
pm2 save
```

### 6. Deploy Script'e İzin Ver
```bash
chmod +x deploy.sh
```

### 7. Nginx Kurulumu (Frontend için)
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/fiyatteklif
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # veya IP adresi

    # Frontend (static files)
    location /teklif/ {
        alias /var/www/fiyatteklif/dist/;
        try_files $uri $uri/ /index.html;
    }

    # Mail server proxy
    location /api/ {
        proxy_pass http://localhost:8787;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktif et:
```bash
sudo ln -s /etc/nginx/sites-available/fiyatteklif /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 Her Güncelleme İçin (Basit!)

VPS'e SSH ile bağlan ve:

```bash
cd /var/www/fiyatteklif
./deploy.sh
```

**İşte bu kadar!** 🎉

---

## 📊 PM2 Komutları

```bash
# Status kontrol
pm2 status

# Logları görüntüle
pm2 logs vefa-mail-server

# Yeniden başlat
pm2 restart vefa-mail-server

# Durdur
pm2 stop vefa-mail-server

# Monitoring
pm2 monit
```

---

## 🔒 Güvenlik İpuçları

1. **.env dosyasını asla Git'e eklemeyin** (zaten .gitignore'da)
2. **Firewall ayarlayın:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```
3. **SSL sertifikası ekleyin** (Let's Encrypt ücretsiz):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## 🌐 Frontend URL Güncelleme

Production'da mail server URL'ini güncelleyin:

**src/components/QuotePreview.jsx** içinde:
```javascript
// Development
const apiBase = currentUser?.smtpApiBaseUrl || 'http://localhost:8787';

// Production
const apiBase = currentUser?.smtpApiBaseUrl || 'https://your-domain.com';
```

---

## ⚡ Hızlı Test

```bash
# Mail server health check
curl http://localhost:8787/health

# Nginx test
curl http://your-domain.com/teklif/

# Mail gönderme testi
curl -X POST http://localhost:8787/api/send-quote-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","text":"Test mail"}'
```

---

## 🆘 Sorun Giderme

### Mail server çalışmıyor:
```bash
pm2 logs vefa-mail-server
pm2 restart vefa-mail-server
```

### Port 8787 kullanılıyor:
```bash
sudo lsof -i :8787
sudo kill -9 <PID>
pm2 restart vefa-mail-server
```

### Nginx çalışmıyor:
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```
