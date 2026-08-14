// PM2 Ecosystem Config
module.exports = {
  apps: [
    {
      name: 'vefa-mail-server',
      script: './server/mailServer.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production',
        MAIL_SERVER_PORT: 8787,
        SMTP_SERVER: 'smtp.gmail.com',
        SMTP_PORT: 587
      },
      env_file: '.env',
      error_file: './logs/mail-server-error.log',
      out_file: './logs/mail-server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
