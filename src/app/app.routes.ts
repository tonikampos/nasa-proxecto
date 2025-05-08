import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  { 
    path: 'artist/:id', 
    loadComponent: () => import('./components/artist-detail/artist-detail.component').then(m => m.ArtistDetailComponent)
  },
  {
    path: 'debug', 
    loadComponent: () => import('./components/debug/sw-debug.component').then(m => m.SwDebugComponent)
  },
  { path: '**', redirectTo: '' }
];
