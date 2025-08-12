module.exports = {
  apps: [
    {
      name: 'phimhay247-node-api',
      port: '5000',
      exec_mode: 'cluster',
      instances: 'max',
      max_memory_restart: '1G',
      autorestart: true,
      min_uptime: '30s',
      script: './build/index.js',
      watch: ['src', 'build'],
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'src/public'],
      env: {
        NODE_ENV: 'production'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      update_env: true
    }
  ]
};
