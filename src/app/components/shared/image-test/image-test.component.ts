import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; border: 1px solid #ccc; margin: 20px;">
      <h3>Test de imágenes para diagnóstico</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <!-- Imagen de Last.fm -->
        <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
          <h4>Last.fm (Problema)</h4>
          <img src="https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png" 
               alt="Last.fm test" style="max-width: 100%; height: 150px;">
        </div>
        
        <!-- Imagen alternativa 1 -->
        <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
          <h4>Picsum (Funciona)</h4>
          <img src="https://picsum.photos/300/300" 
               alt="Picsum test" style="max-width: 100%; height: 150px;">
        </div>
        
        <!-- Imagen alternativa 2 -->
        <div style="border: 1px solid #ddd; padding: 10px; text-align: center;">
          <h4>Placeholder.com</h4>
          <img src="https://via.placeholder.com/300" 
               alt="Placeholder test" style="max-width: 100%; height: 150px;">
        </div>
      </div>
    </div>
  `
})
export class ImageTestComponent {}
