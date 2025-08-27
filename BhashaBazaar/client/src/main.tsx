import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              console.log('New content available, please refresh.');
            }
          });
        }
      });
      
      // Listen for background sync (if supported)
      if (registration && registration.sync) {
        registration.sync.register('background-sync-inventory');
      }
      
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
