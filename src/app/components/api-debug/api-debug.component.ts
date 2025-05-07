import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-api-debug',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-card class="debug-card">
      <mat-card-header>
        <mat-card-title>Last.fm API Debug Tool</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        
        <div *ngIf="error" class="error-message">
          <p>Error: {{ error }}</p>
        </div>
        
        <div *ngIf="artists.length > 0">
          <h3>Top Artists from Last.fm API:</h3>
          <div *ngFor="let artist of artists; let i = index" class="artist-debug-item">
            <h4>{{ i + 1 }}. {{ artist.name }}</h4>
            <p>Image URLs:</p>
            <ul>
              <li *ngFor="let img of artist.image">
                {{ img.size }}: {{ img['#text'] }}
                <span *ngIf="img['#text'] === defaultImageUrl">(DEFAULT IMAGE)</span>
              </li>
            </ul>
            <div class="image-preview">
              <div class="image-container" *ngFor="let img of artist.image">
                <p>{{ img.size }}</p>
                <img 
                  *ngIf="img['#text']" 
                  [src]="img['#text']" 
                  [alt]="artist.name + ' - ' + img.size"
                  (error)="onImageError($event)">
                <p *ngIf="!img['#text']">No URL provided</p>
              </div>
            </div>
            <hr>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="fetchDirectData()">
          Fetch Raw Data from Last.fm
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .debug-card {
      margin: 20px;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    .error-message {
      color: red;
      padding: 10px;
      background-color: #ffeeee;
      border-radius: 4px;
    }
    .artist-debug-item {
      margin-bottom: 20px;
      padding: 10px;
      border: 1px solid #eee;
      border-radius: 4px;
    }
    .image-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 10px;
    }
    .image-container {
      border: 1px solid #ccc;
      padding: 10px;
      text-align: center;
      width: 150px;
    }
    .image-container img {
      max-width: 100%;
      max-height: 100px;
      object-fit: contain;
    }
  `]
})
export class ApiDebugComponent implements OnInit {
  apiKey = '2a776af3a7f1a9ff4fad9ac2e31d3a1f'; // Usa la API key de tu servicio
  loading = false;
  error = '';
  artists: any[] = [];
  defaultImageUrl = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchDirectData();
  }

  fetchDirectData() {
    this.loading = true;
    this.error = '';
    this.artists = [];
    
    // Construir la URL de la API de Last.fm
    const apiUrl = 'https://ws.audioscrobbler.com/2.0/';
    const params = {
      method: 'chart.gettopartists',
      api_key: this.apiKey,
      format: 'json',
      limit: '5' // Solo 5 artistas para depuración
    };
    
    // Convertir parámetros a query string
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key as keyof typeof params])}`)
      .join('&');
    
    // Hacer la solicitud
    this.http.get<any>(`${apiUrl}?${queryString}`).subscribe({
      next: (response) => {
        console.log('Raw Last.fm API Response:', response);
        if (response && response.artists && response.artists.artist) {
          this.artists = response.artists.artist;
        } else {
          this.error = 'Response structure is not as expected';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('API Error:', err);
        this.error = `Error accessing Last.fm API: ${err.message}`;
        this.loading = false;
      }
    });
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const errorText = document.createElement('p');
    errorText.textContent = 'Error loading image';
    errorText.style.color = 'red';
    errorText.style.fontSize = '12px';
    imgElement.parentNode?.appendChild(errorText);
  }
}
