import { spawn } from 'node:child_process';
import { createServer } from 'vite';

const backend = spawn(process.execPath, ['server/mailServer.js'], {
  stdio: 'inherit',
  env: process.env
});

let vite;
let shuttingDown = false;

const shutdown = async (exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;
  process.exitCode = exitCode;

  if (vite) {
    await vite.close();
  }
  if (backend.exitCode === null && !backend.killed) {
    backend.kill();
  }
};

backend.on('error', (error) => {
  console.error('API sunucusu başlatılamadı:', error);
  void shutdown(1);
});

backend.on('exit', (code, signal) => {
  if (!shuttingDown) {
    console.error(`API sunucusu durdu (kod: ${code ?? signal}).`);
    void shutdown(code || 1);
  }
});

process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

try {
  let apiReady = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (backend.exitCode !== null) {
      throw new Error('API sunucusu hazır olmadan kapandı.');
    }

    try {
      const response = await fetch('http://localhost:8787/api/catalog');
      const result = await response.json();
      if (response.ok && result.ok && Array.isArray(result.data)) {
        apiReady = true;
        break;
      }
    } catch {
      // The API may still be starting; retry below.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  if (!apiReady) {
    throw new Error('API sunucusu 20 saniye içinde hazır olmadı. Başlangıç günlüklerini kontrol edin.');
  }

  vite = await createServer();
  await vite.listen();
  vite.printUrls();
} catch (error) {
  console.error('Geliştirme ortamı başlatılamadı:', error);
  await shutdown(1);
}
