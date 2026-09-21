import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'DYNAMIC_IMPORT_WARN' ||
          (warning.message && warning.message.includes('cannot be analyzed by Vite'))
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  plugins: [
    {
      name: 'suppress-esms-warning',
      configResolved(config) {
        const originalWarn = config.logger.warn;
        config.logger.warn = (msg, options) => {
          if (msg && msg.includes('cannot be analyzed by Vite')) {
            return;
          }
          originalWarn(msg, options);
        };
      },
    },
  ],
});