const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Configurar proxy para la API de Deezer
app.use('/api/deezer', createProxyMiddleware({
  target: 'https://api.deezer.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/deezer': '' // Eliminar el prefijo /api/deezer
  },
  logLevel: 'debug'
}));

// Servir archivos estáticos
const distPath = path.join(__dirname, 'dist/nasa-proxecto/browser');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Manejar todas las rutas de Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Puerto para el servidor
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Open this URL in your browser');
});
