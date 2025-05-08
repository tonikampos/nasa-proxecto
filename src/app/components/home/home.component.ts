// src/app/components/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MusicApiService } from '../../services/music-api.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ArtistCardComponent } from '../shared/artist-card/artist-card.component';
import { ArtistGridComponent } from '../shared/artist-grid/artist-grid.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatProgressSpinnerModule, 
    MatButtonModule, 
    MatIconModule, 
    ArtistCardComponent, 
    ArtistGridComponent,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit {
  artists: any[] = [];
  loading = true;
  viewMode = 'cards';
  searchTerm = '';
  private searchSubject = new Subject<string>();
  
  displayedColumns: string[] = ['name', 'listeners', 'actions'];

  constructor(
    private musicService: MusicApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Intentar cargar datos reales, pero con fallback a datos de demostración
    this.loadTopArtists();
    
    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300) // Esperar 300ms después de la última tecla
    ).subscribe(term => {
      this.performSearch(term);
    });
  }

  loadTopArtists(): void {
    console.log('Cargando artistas principales...');
    this.loading = true;
    
    // Agregar registro para verificar el entorno
    const isNetlify = window.location.hostname.includes('netlify.app');
    console.log(`Entorno: ${isNetlify ? 'Netlify' : 'Local'}`);
    
    // Variable para control de timeout
    let timeoutId: any;
    
    // Establecer un tiempo límite para la carga
    timeoutId = setTimeout(() => {
      if (this.loading) {
        console.warn('Tiempo de espera excedido, usando datos de respaldo');
        this.loading = false;
        // El servicio debería usar datos de demostración en caso de error
      }
    }, 8000); // 8 segundos de espera máxima
    
    this.musicService.getTopArtists(20).subscribe({
      next: (data) => {
        clearTimeout(timeoutId);
        console.log('Artistas cargados:', data.length);
        
        if (data && data.length > 0) {
          this.artists = data;
          
          // Registro extra para depurar problemas de imágenes
          console.log('URLs de imágenes de los primeros 3 artistas:');
          data.slice(0, 3).forEach(artist => {
            console.log(`${artist.name}: ${artist.image}`);
          });
        } else {
          console.warn('No se recibieron artistas de la API');
          this.artists = [];
        }
        
        this.loading = false;
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('Error al cargar artistas:', error);
        this.artists = [];
        this.loading = false;
      }
    });
  }

  onSearch(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  performSearch(term: string): void {
    if (!term.trim()) {
      this.loadTopArtists();
      return;
    }
    
    this.loading = true;
    this.musicService.searchArtists(term).subscribe({
      next: (data) => {
        this.artists = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching artists:', error);
        this.loading = false;
      }
    });
  }

  toggleView(mode: string): void {
    this.viewMode = mode;
  }

  viewDetails(artistId: string): void {
    this.router.navigate(['/artist', artistId]);
  }
}