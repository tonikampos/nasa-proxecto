import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    window.addEventListener('online', () => {
      console.log('📶 Aplicación en modo ONLINE');
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Aplicación en modo OFFLINE - usando caché');
    });
  });
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error('Error durante la inicialización:', err));
