import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.subzo.app',
  appName: 'Subzo',
  webDir: 'dist',
  server: {
    url: 'https://8f6f7216-fd23-4557-bf5f-8e7ab00fbcd0.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
