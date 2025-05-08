import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
        <img [src]="safeImageUrl" 
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
export class ArtistCardComponent implements OnInit, OnChanges {
  @Input() artist: any;
  imageError = false;
  safeImageUrl = '';
  
  ngOnInit() {
    this.processSafeImageUrl();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['artist']) {
      this.imageError = false;
      this.processSafeImageUrl();
    }
  }
  
  processSafeImageUrl() {
    // Inicializar con la imagen predeterminada
    this.safeImageUrl = '/assets/default-artist.jpg';
    
    // Si no hay artista, mantener la imagen predeterminada
    if (!this.artist || this.imageError) {
      return;
    }
    
    // Si no hay imagen, mantener la predeterminada
    if (!this.artist.image) {
      return;
    }
    
    // Proceso de la URL de imagen dependiendo del entorno
    const isNetlify = window.location.hostname.includes('netlify');
    
    // Procesar la URL para asegurar que es HTTPS
    let imageUrl = this.artist.image;
    
    // Si la URL ya es completa y usa HTTPS
    if (imageUrl.startsWith('https://')) {
      // Asegurarse de que usamos el dominio CDN correcto para Deezer
      if (imageUrl.includes('cdn-images.dzcdn.net') || 
          imageUrl.includes('e-cdns-images.dzcdn.net')) {
        this.safeImageUrl = imageUrl;
      } 
      // Cualquier otra URL HTTPS es aceptable
      else {
        this.safeImageUrl = imageUrl;
      }
    } 
    // Si la URL es relativa o HTTP, intentamos repararla
    else {
      // Para URLs HTTP, convertir a HTTPS
      if (imageUrl.startsWith('http://')) {
        this.safeImageUrl = imageUrl.replace('http://', 'https://');
      } 
      // Para URLs relativas, mantener la predeterminada
      else {
        this.safeImageUrl = '/assets/default-artist.jpg';
      }
    }
    
    console.log(`Procesada URL de ${this.artist.name}: ${this.safeImageUrl}`);
  }
  
  handleImageError(event: Event): void {
    console.log('Error loading image for', this.artist?.name);
    this.imageError = true;
    this.safeImageUrl = '/assets/default-artist.jpg';
    (event.target as HTMLImageElement).src = '/assets/default-artist.jpg';
  }
}
