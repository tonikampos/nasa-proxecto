import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
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
        <img [src]="processedImageUrl" 
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
export class ArtistCardComponent implements OnChanges {
  @Input() artist: any;
  processedImageUrl = '/assets/default-artist.jpg';
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['artist']) {
      this.processImageUrl();
    }
  }
  
  processImageUrl() {
    if (!this.artist || !this.artist.image) {
      this.processedImageUrl = '/assets/default-artist.jpg';
      return;
    }
    
    // Siempre asegurar que la URL es HTTPS
    let imageUrl = this.artist.image;
    if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }
    
    // Verificar si es una URL de Deezer
    if (imageUrl.includes('cdn-images.dzcdn.net') || 
        imageUrl.includes('e-cdns-images.dzcdn.net')) {
      this.processedImageUrl = imageUrl;
      console.log(`Imagen de ${this.artist.name} procesada: ${this.processedImageUrl}`);
    } else {
      this.processedImageUrl = imageUrl;
      console.log(`Imagen no Deezer para ${this.artist.name}: ${this.processedImageUrl}`);
    }
  }
  
  handleImageError(event: Event) {
    console.log(`Error cargando imagen para ${this.artist?.name}`);
    this.processedImageUrl = '/assets/default-artist.jpg';
    (event.target as HTMLImageElement).src = '/assets/default-artist.jpg';
  }
}
