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
        <img [src]="isImageWorking ? (artist?.image || '/assets/default-artist.jpg') : '/assets/default-artist.jpg'" 
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
  isImageWorking = true; // Track if external image is working
  
  handleImageError(event: Event): void {
    console.log('Error loading image, using default');
    this.isImageWorking = false; // Mark that external image failed
    (event.target as HTMLImageElement).src = '/assets/default-artist.jpg';
  }
}
