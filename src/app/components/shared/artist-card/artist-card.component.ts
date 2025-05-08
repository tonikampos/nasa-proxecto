import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-artist-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card class="artist-card">
      <mat-card-header>
        <mat-card-title>{{ artist?.name }}</mat-card-title>
        <mat-card-subtitle *ngIf="artist?.listeners">{{ artist?.listeners | number }} fans</mat-card-subtitle>
      </mat-card-header>
      
      <div class="image-container">
        <img [src]="imageUrl" 
             [alt]="artist?.name" 
             class="artist-image"
             (error)="handleImageError($event)">
      </div>
      
      <mat-card-content>
        <p *ngIf="artist?.bio?.summary">{{ artist?.bio?.summary | slice:0:100 }}...</p>
        <p *ngIf="!artist?.bio?.summary">Click to see more details about this artist.</p>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .artist-card {
      height: 100%;
      margin-bottom: 16px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    .artist-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .image-container {
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 8px;
      background-color: #f5f5f5;
    }
    
    .artist-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
    
    mat-card-content {
      padding: 16px;
    }
  `]
})
export class ArtistCardComponent {
  @Input() artist: any;
  imageUrlFailed = false;
  
  get imageUrl(): string {
    if (this.imageUrlFailed || !this.artist?.image) {
      return '/assets/default-artist.jpg';
    }
    
    // Comprobar si estamos en Netlify y usar URL directa fallback si es necesario
    if (window.location.hostname.includes('netlify.app')) {
      // Para datos de demo, las imágenes ya están en formato URL completo
      if (this.artist.id <= 7) {
        return this.artist.image;
      }
      
      // Convertir URL proxy a URL directa para Netlify
      if (this.artist.image.includes('cdn-images.dzcdn.net')) {
        return this.artist.image;
      }
    }
    
    return this.artist?.image || '/assets/default-artist.jpg';
  }
  
  handleImageError(event: Event): void {
    console.log('Error loading image, using default');
    this.imageUrlFailed = true;
    (event.target as HTMLImageElement).src = '/assets/default-artist.jpg';
  }
}
