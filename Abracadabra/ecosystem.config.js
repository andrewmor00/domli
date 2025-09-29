module.exports = {
  apps: [
    {
      name: 'domli-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_NAME: 'domli_db',
        DB_USER: 'postgres',
        DB_PASSWORD: 'password',
        JWT_SECRET: 'your_super_secret_jwt_key_change_this_in_production',
        JWT_EXPIRES_IN: '7d'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    },
    {
      name: 'domli-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run preview',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'development',
        VITE_API_URL: 'http://localhost:3000/api',
        PORT: 4173
      },
      env_production: {
        NODE_ENV: 'production',
        VITE_API_URL: 'http://localhost:3000/api',
        PORT: 4173
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/domli.git',
      path: '/var/www/domli',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 