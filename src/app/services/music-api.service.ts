import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin, catchError } from 'rxjs';

// Interfaces para Deezer
interface DeezerArtistImage {
  picture: string;        // URL pequeña
  picture_small: string;  // 56x56
  picture_medium: string; // 250x250
  picture_big: string;    // 500x500
  picture_xl: string;     // 1000x1000
}

interface DeezerArtist extends DeezerArtistImage {
  id: number;
  name: string;
  link: string;
  share: string;
  nb_album: number;
  nb_fan: number;
  radio: boolean;
  tracklist: string;
  type: string;
}

interface DeezerAlbum extends DeezerArtistImage {
  id: number;
  title: string;
  link: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  md5_image: string;
  release_date: string;
  tracklist: string;
  type: string;
  genres?: {
    data: Array<{name: string, id: number}>
  };
}

interface DeezerTrack {
  id: number;
  title: string;
  title_short: string;
  link: string;
  duration: number;
  rank: number;
  preview: string;
  artist: DeezerArtist;
  album: DeezerAlbum;
  type: string;
}

interface DeezerResponse {
  data: any[];
  total: number;
  next?: string;
}

// Interfaz para los artistas mejorados que usamos en nuestra app
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

@Injectable({
  providedIn: 'root'
})
export class MusicApiService {
  // URL relativa que pasará por el proxy
  private deezerApiUrl = '/api/deezer';
  private cachedArtists: EnhancedArtist[] = [];
  private defaultImage = '/assets/default-artist.jpg';
  
  constructor(private http: HttpClient) { }

  getTopArtists(count: number = 10): Observable<EnhancedArtist[]> {
    console.log('Obteniendo artistas principales...');
    
    if (this.cachedArtists.length >= count) {
      return of(this.cachedArtists.slice(0, count));
    }

    // Usando URL proxy
    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/chart/0/artists?limit=${count}`).pipe(
      map(response => {
        console.log('Deezer response:', response);
        
        if (response && response.data && response.data.length > 0) {
          this.cachedArtists = response.data.map((artist: DeezerArtist, index: number) => {
            console.log(`Procesando artista Deezer: ${artist.name}`);
            
            // Elegir la mejor imagen disponible
            let imageUrl = artist.picture_big || artist.picture_medium || artist.picture_small || artist.picture || this.defaultImage;
            console.log(`Imagen para ${artist.name}: ${imageUrl}`);
            
            return {
              id: artist.id.toString(),
              name: artist.name,
              image: imageUrl,
              listeners: artist.nb_fan?.toString() || '0',
              url: artist.link || '',
              categories: ['Music', 'Artist'],
              rating: Math.floor(Math.random() * 5) + 1,
              progress: Math.floor(Math.random() * 100),
              albums: [],
              tags: []
            };
          });

          // Enriquecemos los datos con información adicional
          const artistObservables = this.cachedArtists.map(artist => 
            this.enrichArtistData(artist.id)
          );

          if (artistObservables.length > 0) {
            forkJoin(artistObservables).subscribe(enrichedData => {
              enrichedData.forEach((data, index) => {
                if (data && this.cachedArtists[index]) {
                  this.cachedArtists[index] = { ...this.cachedArtists[index], ...data };
                }
              });
            });
          }
          
          return this.cachedArtists;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener artistas de Deezer:', error);
        // En caso de error, usar datos de demostración
        return of(this.getDemoArtists());
      })
    );
  }

  getArtistById(id: string): Observable<EnhancedArtist | null> {
    const cachedArtist = this.cachedArtists.find(artist => artist.id === id);
    if (cachedArtist && cachedArtist.albums && cachedArtist.albums.length > 0) {
      return of(cachedArtist);
    }
    
    // Usando URL proxy
    return this.http.get<DeezerArtist>(`${this.deezerApiUrl}/artist/${id}`).pipe(
      map(artist => {
        if (artist) {
          const artistIndex = this.cachedArtists.findIndex(a => a.id === id);
          
          const imageUrl = artist.picture_big || artist.picture_medium || artist.picture || this.defaultImage;
          
          const artistData: EnhancedArtist = {
            id: artist.id.toString(),
            name: artist.name,
            image: imageUrl,
            listeners: artist.nb_fan?.toString() || '0',
            url: artist.link || '',
            categories: ['Music', 'Artist'],
            rating: Math.floor(Math.random() * 5) + 1,
            progress: Math.floor(Math.random() * 100),
            albums: [],
            tags: [],
            bio: {
              summary: `${artist.name} es un artista con ${artist.nb_fan} fans en Deezer.`,
              content: `${artist.name} es un artista con ${artist.nb_fan} fans en Deezer. Consulta más información en ${artist.link}`
            }
          };
          
          this.getArtistAlbums(id).subscribe(albums => {
            artistData.albums = albums;
          });

          if (artistIndex >= 0) {
            this.cachedArtists[artistIndex] = artistData;
          } else {
            this.cachedArtists.push(artistData);
          }
          
          return artistData;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error al obtener detalles del artista:', error);
        // Buscar en datos de demo
        const demoArtist = this.getDemoArtists().find(a => a.id === id);
        return of(demoArtist || null);
      })
    );
  }

  getArtistAlbums(artistId: string): Observable<any[]> {
    // Usando URL proxy
    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/artist/${artistId}/albums?limit=10`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data.map((album: DeezerAlbum, index: number) => ({
            id: album.id.toString(),
            name: album.title,
            image: album.cover_medium || album.cover || this.defaultImage,
            url: album.link,
            release_date: album.release_date
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al obtener álbumes:', error);
        return of([]);
      })
    );
  }

  private enrichArtistData(artistId: string): Observable<any> {
    // Usando URL proxy
    return this.http.get<any>(`${this.deezerApiUrl}/artist/${artistId}/top?limit=5`).pipe(
      map(response => {
        if (response && response.data && response.data.length > 0) {
          let genres: string[] = ['Pop', 'Rock']; // Géneros por defecto
          
          try {
            const extractedGenres: string[] = [];
            
            response.data.forEach((track: DeezerTrack) => {
              if (track && 
                  track.album && 
                  track.album.genres && 
                  track.album.genres.data) {
                
                track.album.genres.data.forEach(genre => {
                  if (genre && genre.name) {
                    extractedGenres.push(genre.name);
                  }
                });
              }
            });
            
            if (extractedGenres.length > 0) {
              genres = [...new Set(extractedGenres)];
            }
          } catch (error) {
            console.warn('Error extracting genres:', error);
          }
          
          return {
            tags: genres,
            bio: {
              summary: `Artista popular en Deezer con ${response.data.length} canciones top.`,
              content: `Artista popular en Deezer. Entre sus canciones destacadas están ${response.data.map((t: DeezerTrack) => t.title).join(', ')}.`
            }
          };
        }
        return {
          tags: ['Pop', 'Rock'],
          bio: {
            summary: 'Artista en Deezer.',
            content: 'Información no disponible para este artista.'
          }
        };
      }),
      catchError(error => {
        console.error('Error al enriquecer datos del artista:', error);
        return of({
          tags: ['Pop', 'Rock'],
          bio: {
            summary: 'Artista en Deezer.',
            content: 'Información no disponible para este artista.'
          }
        });
      })
    );
  }

  searchArtists(query: string): Observable<EnhancedArtist[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }

    // Usando URL proxy
    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/search/artist?q=${encodeURIComponent(query)}&limit=10`).pipe(
      map(response => {
        if (response && response.data) {
          return response.data.map((artist: DeezerArtist) => ({
            id: artist.id.toString(),
            name: artist.name,
            image: artist.picture_big || artist.picture_medium || artist.picture || this.defaultImage,
            listeners: artist.nb_fan?.toString() || '0',
            url: artist.link || '',
            categories: ['Music', 'Artist'],
            rating: Math.floor(Math.random() * 5) + 1,
            progress: Math.floor(Math.random() * 100),
            albums: [],
            tags: []
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Error al buscar artistas:', error);
        return of([]);
      })
    );
  }

  // Método para proporcionar datos de demostración cuando la API no responde
  private getDemoArtists(): EnhancedArtist[] {
    return [
      {
        id: '1',
        name: 'Coldplay',
        image: 'https://e-cdns-images.dzcdn.net/images/artist/e5fc8175f13e861f90580b323c/500x500-000000-80-0-0.jpg',
        listeners: '14500000',
        url: 'https://www.deezer.com/artist/892',
        categories: ['Music', 'Rock'],
        rating: 5,
        progress: 95,
        albums: [],
        tags: ['Rock', 'Pop', 'Alternative'],
        bio: {
          summary: 'Coldplay es una banda británica de rock formada en Londres en 1996.',
          content: 'Coldplay es una banda británica de rock formada en Londres en 1996. Está integrada por Chris Martin, Jon Buckland, Guy Berryman y Will Champion.'
        }
      },
      // ... otros artistas de demostración ...
      {
        id: '2',
        name: 'Ed Sheeran',
        image: 'https://e-cdns-images.dzcdn.net/images/artist/ac068805530127b0ec307cf465829166/500x500-000000-80-0-0.jpg',
        listeners: '18700000',
        url: 'https://www.deezer.com/artist/384236',
        categories: ['Music', 'Pop'],
        rating: 4,
        progress: 88,
        albums: [],
        tags: ['Pop', 'Folk', 'Acoustic'],
        bio: {
          summary: 'Ed Sheeran es un cantautor británico.',
          content: 'Edward Christopher Sheeran es un cantautor y músico británico. Nacido en Halifax, West Yorkshire y criado en Framlingham, Suffolk.'
        }
      },
      {
        id: '3',
        name: 'Taylor Swift',
        image: 'https://e-cdns-images.dzcdn.net/images/artist/5e342bdef1d9695894b71b67e8782604/500x500-000000-80-0-0.jpg',
        listeners: '22100000',
        url: 'https://www.deezer.com/artist/12246',
        categories: ['Music', 'Pop'],
        rating: 5,
        progress: 97,
        albums: [],
        tags: ['Pop', 'Country', 'Folk'],
        bio: {
          summary: 'Taylor Swift es una cantautora estadounidense.',
          content: 'Taylor Alison Swift es una cantautora, productora, directora, actriz y empresaria estadounidense.'
        }
      }
    ];
  }
}