# Yerel Geliştirme

Bağımlılıkları kurduktan sonra `npm run dev` komutu API sunucusunu ve Vite arayüzünü birlikte başlatır. Uygulama Vite'ın gösterdiği yerel adresten açılır. Durdurmak için terminalde `Ctrl+C` kullanın.

E-posta gönderimi için `.env` dosyasında SMTP ayarları gerekir; bu ayarlar olmadan da API ve katalog çalışır.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
