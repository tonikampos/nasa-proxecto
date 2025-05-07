// Este script generará automáticamente iconos para la PWA
// Ejecutar con Node.js: node generate-icons.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Asegúrate de tener instalado canvas: npm install canvas

// Tamaños de iconos requeridos
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio para iconos si no existe
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Función para generar un icono simple
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo
  ctx.fillStyle = '#3f51b5'; // Color primario Material
  ctx.fillRect(0, 0, size, size);
  
  // Borde
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.03;
  ctx.strokeRect(size * 0.1, size * 0.1, size * 0.8, size * 0.8);
  
  // Círculo central (como un disco)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.25, 0, Math.PI * 2);
  ctx.fill();
  
  // Círculo interno (como un agujero del disco)
  ctx.fillStyle = '#3f51b5';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  // Nota musical
  ctx.fillStyle = '#ffffff';
  // Cabeza de la nota
  ctx.beginPath();
  ctx.ellipse(size * 0.65, size * 0.4, size * 0.08, size * 0.06, Math.PI / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Stem de la nota
  ctx.fillRect(size * 0.72, size * 0.25, size * 0.02, size * 0.35);
  
  // Guardar como PNG
  const buffer = canvas.toBuffer('image/png');
  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`Generado: ${filename}`);
}

// Generar iconos para todos los tamaños
sizes.forEach(size => generateIcon(size));
console.log('Generación de iconos completada.');
