// Proxy para http-server
const httpProxy = require('http-proxy');
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

// Crear proxy
const proxy = httpProxy.createProxyServer({});

// Crear servidor
const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url);
  const pathname = reqUrl.pathname;

  console.log(`Requested: ${pathname}`);

  // Proxy requests to Deezer API
  if (pathname.startsWith('/api/deezer/')) {
    console.log('Proxying to Deezer API...');
    const target = pathname.replace('/api/deezer', '');
    const query = reqUrl.search || '';
    
    proxy.web(req, res, { 
      target: `https://api.deezer.com${target}${query}`,
      changeOrigin: true,
      headers: {
        'Origin': 'http://localhost:8081'
      }
    });
    return;
  }

  // Serve static files
  const filePath = path.join(__dirname, 'dist/nasa-proxecto/browser', pathname === '/' ? 'index.html' : pathname);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (!err) {
      // File exists, serve it
      fs.createReadStream(filePath).pipe(res);
    } else {
      // File not found, serve index.html (for Angular routes)
      fs.createReadStream(path.join(__dirname, 'dist/nasa-proxecto/browser', 'index.html')).pipe(res);
    }
  });
});

// Cambiar el puerto a 8081 u otro disponible
const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Something went wrong with the proxy request.');
});
