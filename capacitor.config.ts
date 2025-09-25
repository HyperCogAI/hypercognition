import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b6a67e956e1f4ed690e27be22237d647',
  appName: 'dexflow-ai-hub',
  webDir: 'dist',
  server: {
    url: 'https://b6a67e95-6e1f-4ed6-90e2-7be22237d647.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f0f0f',
      showSpinner: true,
      spinnerColor: '#6366f1'
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#0f0f0f',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    }
  }
};

export default config;