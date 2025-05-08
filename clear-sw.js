// Ejecutar este script en la consola del navegador cuando necesites borrar el Service Worker

async function clearServiceWorkers() {
  if ('serviceWorker' in navigator) {
    console.log('Obteniendo registros de Service Worker...');
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    console.log(`Encontrados ${registrations.length} registros`);
    
    for (let registration of registrations) {
      console.log(`Eliminando Service Worker de: ${registration.scope}`);
      await registration.unregister();
      console.log('✓ Service Worker eliminado');
    }
    
    console.log('Limpiando caché...');
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    
    console.log('✅ Todos los Service Workers y cachés han sido eliminados');
    console.log('🔄 Recarga la página para ver los cambios');
  } else {
    console.warn('Service Worker no está soportado en este navegador');
  }
}

clearServiceWorkers();
