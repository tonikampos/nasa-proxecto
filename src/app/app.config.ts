import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    // Descomentamos el service worker para habilitarlo
    provideServiceWorker('ngsw-worker.js', {
      enabled: true, // Forzar habilitación incluso en desarrollo
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
