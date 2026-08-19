# ✅ Production Deployment Checklist

## 🎯 Sistem Hazır Durumu

### ✅ HAZIR Özellikler

1. **SQLite Database** ✅
   - Dosya tabanlı veritabanı (`database/vefa.db`)
   - Kurulum gerektirmiyor
   - Tüm kullanıcılar aynı veritabanını görür
   - Otomatik tablo oluşturma

2. **Backend Server** ✅
   - Express server port 8787
   - API routes çalışıyor
   - Static file serving eklendi
   - SPA routing desteği var

3. **Frontend Build** ✅
   - Vite build sistemi
   - Production optimize
   - `npm run build` ile dist/ klasörüne çıkar

4. **Process Manager** ✅
   - PM2 config hazır (`ecosystem.config.cjs`)
   - Auto-restart aktif
   - Log dosyaları ayarlandı
   - Memory limit: 200MB

5. **Deployment** ✅
   - Otomatik deploy script (`deploy.sh`)
   - Git pull + npm install + build + restart
   - Tek komut: `./deploy.sh`

6. **Görev Sistemi** ✅
   - Task management API çalışıyor
   - Dashboard entegrasyonu yapıldı
   - Kullanıcılar kendine atanan görevleri görür

---

## 🚀 VPS'e Deployment Adımları

### 1. VPS Gereksinimleri

**Minimum:**
- Ubuntu 20.04+ (veya benzeri Linux)
- Node.js 18+ (`node -v` ile kontrol edin)
- npm 9+ (`npm -v` ile kontrol edin)
- 1 GB RAM (minimum)
- 10 GB Disk

**Node.js Kurulumu (yoksa):**
```bash
# NodeSource'dan güncel Node.js 18.x yükle
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. İlk Kurulum (Bir Kerelik)

```bash
# 1. VPS'e SSH ile bağlan
ssh user@YOUR_VPS_IP

# 2. Proje dizini oluştur
sudo mkdir -p /var/www
cd /var/www

# 3. Projeyi clone et (GitHub repo gerekli)
sudo git clone https://github.com/YOUR_USERNAME/fiyatteklif.git
cd fiyatteklif

# 4. Sahipliği düzenle
sudo chown -R $USER:$USER /var/www/fiyatteklif

# 5. .env dosyasını oluştur
nano .env
```

**.env İçeriği:**
```env
# Mail Server Configuration
MAIL_SERVER_PORT=8787

# SMTP Settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

# Email Credentials
EMAIL_ADDRESS=alpaslan@vefaegitimkurumlari.com
EMAIL_PASSWORD=zlhs jsbc quxo angb
EMAIL_FROM=alpaslan@vefaegitimkurumlari.com
```

Kaydet: `Ctrl+O` → `Enter` → `Ctrl+X`

```bash
# 6. PM2'yi global olarak yükle
sudo npm install -g pm2

# 7. Log klasörünü oluştur
mkdir -p logs

# 8. Dependencies yükle
npm install

# 9. Frontend'i build et
npm run build

# 10. Deploy script'i çalıştırılabilir yap
chmod +x deploy.sh

# 11. Mail server'ı başlat
pm2 start ecosystem.config.cjs

# 12. PM2'yi sistem başlangıcına ekle (BİR KERELİK!)
pm2 startup
# ↑ Bu komut size bir 'sudo ...' komutu verecek, onu çalıştırın

# 13. PM2 listesini kaydet (BİR KERELİK!)
pm2 save

# 14. Durumu kontrol et
pm2 status
pm2 logs vefa-mail-server --lines 50
```

### 3. Port Ayarları

**Backend zaten çalışıyor:** http://YOUR_VPS_IP:8787

**Frontend için 2 seçenek:**

#### Seçenek A: Nginx ile Reverse Proxy (ÖNERİLEN)

```bash
# Nginx yükle
sudo apt update
sudo apt install nginx -y

# Nginx config oluştur
sudo nano /etc/nginx/sites-available/fiyatteklif
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com;  # veya VPS IP adresi

    # Frontend - Static files
    location /teklif/ {
        proxy_pass http://localhost:8787/teklif/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://localhost:8787/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Config'i aktifleştir
sudo ln -s /etc/nginx/sites-available/fiyatteklif /etc/nginx/sites-enabled/

# Nginx'i test et
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Sistem başlangıcında otomatik başlat
sudo systemctl enable nginx
```

**Erişim:**
- Frontend: http://YOUR_DOMAIN.com/teklif/
- API: http://YOUR_DOMAIN.com/api/

#### Seçenek B: Sadece Backend Port (Basit)

Hiçbir şey yapma, backend zaten static file serve ediyor!

**Erişim:**
- Frontend: http://YOUR_VPS_IP:8787/teklif/
- API: http://YOUR_VPS_IP:8787/api/

---

## 🔄 Güncelleme (Kod Değişikliğinden Sonra)

**Tek Komut:**
```bash
cd /var/www/fiyatteklif
./deploy.sh
```

**Veya Manuel:**
```bash
cd /var/www/fiyatteklif
git pull
npm install
npm run build
pm2 restart vefa-mail-server
```

---

## 📊 Sistem Yönetimi

### PM2 Komutları

```bash
# Durumu göster
pm2 status

# Logları canlı izle
pm2 logs vefa-mail-server

# Son 100 satır log
pm2 logs vefa-mail-server --lines 100

# Yeniden başlat
pm2 restart vefa-mail-server

# Durdur
pm2 stop vefa-mail-server

# Başlat
pm2 start vefa-mail-server

# Memory/CPU kullanımı izle
pm2 monit
```

### Database Yedekleme

```bash
# Veritabanını yedekle
cp database/vefa.db database/vefa_backup_$(date +%Y%m%d_%H%M%S).db

# Otomatik günlük yedek (crontab)
crontab -e
# Ekle: 0 2 * * * cd /var/www/fiyatteklif && cp database/vefa.db database/vefa_backup_$(date +\%Y\%m\%d).db
```

### Log Temizleme

```bash
# Log dosyalarını temizle
pm2 flush

# Eski log dosyalarını sil
rm -f logs/*.log
```

---

## 🔒 Güvenlik

### SSL Sertifikası (Let's Encrypt - ÜCRETSİZ)

```bash
# Certbot yükle
sudo apt install certbot python3-certbot-nginx -y

# SSL sertifikası al
sudo certbot --nginx -d YOUR_DOMAIN.com

# Otomatik yenileme (zaten aktif)
sudo certbot renew --dry-run
```

### Firewall

```bash
# UFW yükle ve aktifleştir
sudo apt install ufw -y

# HTTP ve HTTPS'e izin ver
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# SSH'e izin ver (bunu kapatmayın!)
sudo ufw allow 22/tcp

# Firewall'ı aktifleştir
sudo ufw enable

# Durumu kontrol et
sudo ufw status
```

---

## ✅ Test Checklist

VPS'e deploy ettikten sonra:

- [ ] Backend çalışıyor mu? → `curl http://localhost:8787/health`
- [ ] Frontend yükleniyor mu? → Tarayıcıda `http://YOUR_VPS_IP:8787/teklif/`
- [ ] Login çalışıyor mu?
- [ ] Müşteri eklenebiliyor mu?
- [ ] Teklif oluşturuluyor mu?
- [ ] Görevler görünüyor mu?
- [ ] Dashboard'da görevler yükleniyor mu?
- [ ] PM2 auto-restart çalışıyor mu? → `pm2 stop vefa-mail-server` → bekle 5 saniye → `pm2 status`

---

## 🆘 Sorun Giderme

### Backend başlamıyor
```bash
pm2 logs vefa-mail-server --err --lines 50
```

### Frontend 404 veriyor
```bash
# dist/ klasörü var mı kontrol et
ls -la dist/

# Yoksa build et
npm run build
pm2 restart vefa-mail-server
```

### Database hatası
```bash
# Database dosyası var mı?
ls -la database/vefa.db

# Yoksa server başlatınca otomatik oluşturulur
pm2 restart vefa-mail-server
pm2 logs vefa-mail-server --lines 20
```

### Port 8787 kullanımda
```bash
# Port'u kullanan process'i bul
sudo lsof -i :8787

# Kill et
sudo kill -9 PID_NUMBER

# PM2'yi yeniden başlat
pm2 restart vefa-mail-server
```

---

## 📝 Önemli Notlar

1. **Node.js 18+** şart! (`node -v`)
2. **.env dosyası** mutlaka olmalı
3. **pm2 startup** ve **pm2 save** sadece ilk kurulumda çalıştırın
4. **Database yedekleme** düzenli yapın
5. **SSL sertifikası** kullanın (Let's Encrypt ücretsiz)
6. **Firewall** aktif tutun
7. **logs/** klasörü düzenli temizleyin

---

## 🎉 Sistem Canlıda!

**Erişim URL'leri:**

- Frontend: http://YOUR_DOMAIN.com/teklif/
- API: http://YOUR_DOMAIN.com/api/
- Health Check: http://YOUR_DOMAIN.com/health

**Tüm kullanıcılar aynı veritabanını görür!** ✅
