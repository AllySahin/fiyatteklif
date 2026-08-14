#!/bin/bash
# VPS Deploy Script - Otomatik güncelleme ve yeniden başlatma

echo "🚀 Deployment başlıyor..."

# Git pull
echo "📥 Kodlar güncelleniyor..."
git pull origin main

# Dependencies install
echo "📦 Bağımlılıklar yükleniyor..."
npm install --production

# Frontend build
echo "🔨 Frontend build ediliyor..."
npm run build

# Mail server'ı yeniden başlat
echo "✉️ Mail server yeniden başlatılıyor..."
pm2 restart ecosystem.config.cjs

echo "✅ Deployment tamamlandı!"
echo ""
pm2 status
