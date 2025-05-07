import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MusicApiService } from '../../services/music-api.service';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

interface CategoryNode {
  name: string;
  children?: CategoryNode[];
}

interface FlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink,
    MatProgressSpinnerModule, 
    MatIconModule, 
    MatButtonModule, 
    MatTabsModule,
    MatExpansionModule,
    MatTreeModule,
    MatSliderModule,
    MatProgressBarModule,
    MatCardModule
  ]
})
export class ArtistDetailComponent implements OnInit {
  artist: any = null;
  loading = true;
  showDetails = false;

  // Tree control setup for categories
  private transformer = (node: CategoryNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
    };
  }

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level, node => node.expandable);

  treeFlattener = new MatTreeFlattener(
    this.transformer, node => node.level, 
    node => node.expandable, node => node.children);

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private musicService: MusicApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArtistDetails(id);
    } else {
      this.router.navigate(['/']);
    }
  }

  loadArtistDetails(id: string): void {
    this.loading = true;
    this.musicService.getArtistById(id).subscribe({
      next: (data) => {
        this.artist = data;
        this.loading = false;
        
        // Setup tree data for tags and categories
        this.setupTreeData();
      },
      error: (error) => {
        console.error('Error fetching artist details:', error);
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  setupTreeData(): void {
    if (this.artist) {
      const data: CategoryNode[] = [];
      
      // Add categories node
      if (this.artist.categories && this.artist.categories.length > 0) {
        data.push({
          name: 'Categories',
          children: this.artist.categories.map((category: string) => ({ name: category }))
        });
      }
      
      // Add tags node
      if (this.artist.tags && this.artist.tags.length > 0) {
        data.push({
          name: 'Genres',
          children: this.artist.tags.map((tag: any) => {
            return { name: typeof tag === 'string' ? tag : (tag.name || tag) };
          })
        });
      }
      
      this.dataSource.data = data;
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = '/assets/default-artist.jpg';
  }
}
