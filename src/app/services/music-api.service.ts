import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin, catchError, retry } from 'rxjs';

interface DeezerArtistImage {
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
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
  private deezerApiUrl = '/api/deezer';
  private defaultImage = '/assets/icons/icon-512x512.png';
  private cachedArtists: EnhancedArtist[] = [];
  private isOfflineMode = !navigator.onLine;
  
  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.isOfflineMode = false);
    window.addEventListener('offline', () => this.isOfflineMode = true);
  }

  private getImageUrl(artist: DeezerArtist): string {
    let imageUrl = artist.picture_big || 
                   artist.picture_medium || 
                   artist.picture_small || 
                   artist.picture;
    
    if (!imageUrl || !this.isValidImageUrl(imageUrl)) {
      console.log(`Usando imagen por defecto para ${artist.name} - URL original: ${imageUrl}`);
      return this.defaultImage;
    }
    
    if (imageUrl.includes('https:https://') || imageUrl.includes('http:https://')) {
      imageUrl = imageUrl.replace('https:https://', 'https://').replace('http:https://', 'https://');
    }
    
    if (imageUrl.startsWith('http:')) {
      imageUrl = imageUrl.replace('http:', 'https:');
    }
    
    return imageUrl;
  }
  
  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    try {
      return url.startsWith('http') && 
             (url.includes('.jpg') || 
              url.includes('.jpeg') || 
              url.includes('.png') || 
              url.includes('.webp') ||
              url.includes('.gif'));
    } catch (e) {
      return false;
    }
  }

  getTopArtists(count: number = 20): Observable<EnhancedArtist[]> {
    if (this.cachedArtists.length >= count) {
      return of(this.cachedArtists.slice(0, count));
    }

    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/chart/0/artists?limit=${count}`)
      .pipe(
        retry(3),
        map(response => {
          if (response && response.data && response.data.length > 0) {
            this.cachedArtists = response.data.map((artist: DeezerArtist) => {
              const imageUrl = this.getImageUrl(artist);
              
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
                tags: ['Music']
              };
            });
            
            return this.cachedArtists;
          }
          return [];
        }),
        catchError(error => {
          this.cachedArtists = [{
            id: '0',
            name: 'Error cargando artistas',
            image: this.defaultImage,
            listeners: '0',
            url: '',
            categories: ['Error'],
            rating: 0,
            progress: 0,
            albums: [],
            tags: ['Error']
          }];
          
          return of(this.cachedArtists);
        })
      );
  }

  getArtistById(id: string): Observable<EnhancedArtist | null> {
    const cachedArtist = this.cachedArtists.find(artist => artist.id === id);
    if (cachedArtist && cachedArtist.albums && cachedArtist.albums.length > 0) {
      return of(cachedArtist);
    }
    
    return this.http.get<DeezerArtist>(`${this.deezerApiUrl}/artist/${id}`).pipe(
      retry(2),
      map(artist => {
        if (artist) {
          const artistIndex = this.cachedArtists.findIndex(a => a.id === id);
          
          const imageUrl = this.getImageUrl(artist);
          console.log(`Imagen obtenida para artista ${artist.name}: ${imageUrl}`);
          
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
            console.log(`Álbumes obtenidos para ${artist.name}:`, albums.length);
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
        return of(null);
      })
    );
  }

  getArtistAlbums(artistId: string): Observable<any[]> {
    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/artist/${artistId}/albums?limit=10`).pipe(
      map(response => {
        if (response && response.data) {
          console.log(`Obtenidos ${response.data.length} álbumes para artista ID ${artistId}`);
          return response.data.map((album: DeezerAlbum) => ({
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
    return this.http.get<any>(`${this.deezerApiUrl}/artist/${artistId}/top?limit=5`).pipe(
      map(response => {
        if (response && response.data && response.data.length > 0) {
          console.log(`Obtenidas ${response.data.length} canciones top para artista ID ${artistId}`);
          let genres: string[] = ['Pop', 'Rock'];
          
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
              console.log(`Géneros extraídos para artista ID ${artistId}:`, genres);
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

    console.log(`Buscando artistas con término: "${query}"`);
    return this.http.get<DeezerResponse>(`${this.deezerApiUrl}/search/artist?q=${encodeURIComponent(query)}&limit=10`).pipe(
      retry(2),
      map(response => {
        if (response && response.data) {
          console.log(`Encontrados ${response.data.length} artistas para "${query}"`);
          return response.data.map((artist: DeezerArtist) => ({
            id: artist.id.toString(),
            name: artist.name,
            image: this.getImageUrl(artist),
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
}