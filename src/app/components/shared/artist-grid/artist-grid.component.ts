import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-artist-grid',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <table mat-table [dataSource]="artists" class="mat-elevation-z8 full-width">
      <!-- Name Column -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Artist</th>
        <td mat-cell *matCellDef="let element">{{element.name}}</td>
      </ng-container>

      <!-- Fans Column -->
      <ng-container matColumnDef="listeners">
        <th mat-header-cell *matHeaderCellDef>Fans</th>
        <td mat-cell *matCellDef="let element">{{element.listeners | number}}</td>
      </ng-container>

      <!-- Actions Column -->
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef>Actions</th>
        <td mat-cell *matCellDef="let element">
          <button mat-icon-button color="primary" (click)="onViewDetails(element.id, $event)">
            <mat-icon>visibility</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onRowClick(row)"></tr>
    </table>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    
    tr.mat-mdc-row:hover {
      background-color: rgba(0,0,0,0.04);
      cursor: pointer;
    }
  `]
})
export class ArtistGridComponent {
  @Input() artists: any[] = [];
  @Input() displayedColumns: string[] = ['name', 'listeners', 'actions'];
  @Output() rowClick = new EventEmitter<string>();

  onViewDetails(id: string, event: Event): void {
    event.stopPropagation();
    console.log('View details clicked for artist:', id);
    this.rowClick.emit(id);
  }

  onRowClick(row: any): void {
    console.log('Row clicked for artist:', row.id);
    this.rowClick.emit(row.id);
  }
}
