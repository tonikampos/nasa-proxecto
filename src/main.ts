import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { isDevMode } from '@angular/core';

console.log('🚀 Iniciando aplicación Music Explorer...');
console.log('📱 PWA habilitada: Service Worker configurado');

// Diagnóstico de Service Worker
if ('serviceWorker' in navigator) {
  console.log('✅ API de Service Worker disponible en el navegador');
  
  window.addEventListener('load', () => {
    // Verificamos registros existentes
    navigator.serviceWorker.getRegistrations().then(registrations => {
      console.log(`Service Workers registrados actualmente: ${registrations.length}`);
      
      if (registrations.length > 0) {
        registrations.forEach(reg => {
          console.log(`- SW registrado en: ${reg.scope}`);
          // Verificar estado
          console.log(`- Estado: ${reg.active ? 'activo' : 'inactivo'}`);
          // Verificar modos
          console.log(`- Modo offline soportado: ${navigator.onLine ? 'online' : 'offline'}`);
        });
      }
    });
    
    // Añadimos detección de modo offline/online
    window.addEventListener('online', () => {
      console.log('📶 Aplicación en modo ONLINE');
    });
    
    window.addEventListener('offline', () => {
      console.log('📴 Aplicación en modo OFFLINE - usando caché');
    });
  });
} else {
  console.warn('⚠️ API de Service Worker no disponible en este navegador');
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error('Error durante la inicialización:', err));
