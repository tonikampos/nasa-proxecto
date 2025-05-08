import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MusicApiService } from '../../services/music-api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

// Definir la interfaz localmente para evitar problemas de importación
interface EnhancedArtist {
  id: string;
  name: string;
  image: string;
  listeners: string;
  url: string;
  categories: string[];
  rating: number;
  progress: number;
  albums: any[];
  tags: any[];
  bio?: {
    summary: string;
    content: string;
  };
}

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressBarModule, 
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="detail-container">
      <mat-card *ngIf="artist">
        <mat-card-header>
          <div class="header-content">
            <div class="title-section">
              <mat-card-title>{{ artist.name }}</mat-card-title>
              <mat-card-subtitle>{{ artist.listeners | number }} fans</mat-card-subtitle>
            </div>
            <button mat-icon-button color="primary" (click)="goBack()" aria-label="Back">
              <mat-icon>arrow_back</mat-icon>
            </button>
          </div>
        </mat-card-header>
        
        <img [src]="artist.image" [alt]="artist.name" class="artist-image">
        
        <mat-card-content>
          <button mat-raised-button color="primary" (click)="showAllDetails = !showAllDetails">
            {{ showAllDetails ? 'Hide Details' : 'Show All Details' }}
          </button>
          
          <div *ngIf="showAllDetails" class="details-section">
            <!-- Usar divs y h3 en lugar de mat-tabs para simplificar -->
            <div class="simple-tabs">
              <h3>Information</h3>
              <div>
                <h4>About {{ artist.name }}</h4>
                <p *ngIf="artist.bio?.content">{{ artist.bio?.content }}</p>
                <p *ngIf="!artist.bio?.content">No detailed information available for this artist.</p>
                
                <h4>Genres</h4>
                <div class="tags-container">
                  <span class="tag" *ngFor="let tag of artist.tags">{{ tag }}</span>
                </div>
                
                <h4>Popularity</h4>
                <div class="progress-section">
                  <p>Rating: {{ artist.rating }}/5</p>
                  <mat-progress-bar 
                    [value]="artist.progress" 
                    [color]="getProgressColor(artist.progress)">
                  </mat-progress-bar>
                  <p class="progress-label">Popularity: {{ artist.progress }}%</p>
                </div>
              </div>

              <h3 *ngIf="artist.albums && artist.albums.length">Albums</h3>
              <div *ngIf="artist.albums && artist.albums.length" class="albums-container">
                <mat-card *ngFor="let album of artist.albums" class="album-card">
                  <img [src]="album.image" [alt]="album.name" class="album-image">
                  <mat-card-content>
                    <h4>{{ album.name }}</h4>
                    <p *ngIf="album.release_date">Released: {{ album.release_date | date }}</p>
                  </mat-card-content>
                </mat-card>
              </div>

              <h3>Links</h3>
              <div>
                <mat-expansion-panel>
                  <mat-expansion-panel-header>
                    <mat-panel-title>External Links</mat-panel-title>
                  </mat-expansion-panel-header>
                  <p *ngIf="artist.url">
                    <a [href]="artist.url" target="_blank">Official Deezer Page</a>
                  </p>
                  <p *ngIf="!artist.url">No links available</p>
                </mat-expansion-panel>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <div *ngIf="!artist && !error" class="loading">
        <mat-spinner></mat-spinner>
        <p>Loading artist details...</p>
      </div>
      
      <div *ngIf="error" class="error-message">
        <mat-icon>error</mat-icon>
        <p>Error loading artist details. Please try again later.</p>
        <button mat-raised-button color="primary" (click)="goBack()">Go Back</button>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 0 20px;
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
    }
    
    .artist-image {
      max-width: 100%;
      height: auto;
      max-height: 500px;
      object-fit: contain;
      margin: 20px auto;
      display: block;
    }
    
    .simple-tabs {
      padding: 20px 0;
    }
    
    .simple-tabs h3 {
      color: #3f51b5;
      border-bottom: 2px solid #3f51b5;
      padding-bottom: 8px;
      margin-top: 24px;
    }
    
    .details-section {
      margin-top: 20px;
    }
    
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 10px 0;
    }
    
    .tag {
      background-color: #e0e0e0;
      padding: 5px 10px;
      border-radius: 16px;
      font-size: 14px;
    }
    
    .progress-section {
      margin: 20px 0;
    }
    
    .progress-label {
      text-align: right;
      margin-top: 5px;
    }
    
    .albums-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .album-card {
      text-align: center;
    }
    
    .album-image {
      max-width: 100%;
      height: auto;
    }
    
    .loading, .error-message {
      text-align: center;
      margin-top: 100px;
    }
    
    .error-message mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f44336;
    }
  `]
})
export class ArtistDetailComponent implements OnInit {
  artist: any;
  error = false;
  showAllDetails = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private musicService: MusicApiService
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadArtist(id);
      }
    });
  }
  
  loadArtist(id: string): void {
    this.musicService.getArtistById(id).subscribe({
      next: (data: any) => {
        this.artist = data;
        console.log('Artist details:', this.artist);
      },
      error: (error: any) => {
        console.error('Error loading artist details:', error);
        this.error = true;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/']);
  }
  
  getProgressColor(progress: number): string {
    if (progress < 30) return 'warn';
    if (progress < 70) return 'accent';
    return 'primary';
  }
}
