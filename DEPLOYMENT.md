# 🚀 VPS Deployment Rehberi

## ⚡ Güncelleme Senaryosu (Sizin İçin - 10 Saniye)

**Proje zaten clone edilmiş ve .env var ise:**

```bash
cd fiyatteklif

# 1. Son kodları çek
git pull

# 2. Dependencies güncelle
npm install --production

# 3. Frontend'i yeniden build et
npm run build

# 4. Mail server'ı yeniden başlat
pm2 restart ecosystem.config.cjs
# VEYA
pm2 restart vefa-mail-server
```

**DAHA KOLAY: Tek komutla tümü** 👇
```bash
./deploy.sh
```

---

## 📋 İlk Kurulum (Bir Kerelik - Sadece İlk Defa)

### 1. VPS'e Bağlan
```bash
ssh user@your-vps-ip
```

### 2. PM2 Kur (Yoksa)
```bash
sudo npm install -g pm2
```

### 3. Projeyi Clone Et
```bash
cd /var/www  # veya istediğiniz dizin
git clone https://github.com/YOUR_USERNAME/fiyatteklif.git
cd fiyatteklif
```

### 4. .env Dosyasını Oluştur
```bash
nano .env
```

Mevcut `.env` içeriğinizi yapıştırın ve kaydedin (`Ctrl+O`, `Enter`, `Ctrl+X`)

### 5. İlk Deployment
```bash
# Dependencies yükle
npm install --production

# Frontend build et
npm run build

# Mail server'ı başlat
pm2 start ecosystem.config.cjs

# Sistem başlangıcında otomatik başlat (BİR KERELİK!)
pm2 startup
# ↑ Bu komut size bir sudo komutu verecek, onu çalıştırın

# PM2 listesini kaydet (BİR KERELİK!)
pm2 save

# Deploy script'i çalıştırılabilir yap
chmod +x deploy.sh
```

**Not:** `pm2 startup` ve `pm2 save` komutlarını sadece ilk kurulumda çalıştırın!

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
