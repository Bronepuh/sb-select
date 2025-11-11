module.exports = {
  apps: [
    {
      name: 'sb-select',
      script: 'server-dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5055,
      },
      instances: 1,
      exec_mode: 'fork',
      restart_delay: 2000,
      max_restarts: 10,
      time: true,
    },
  ],
};
