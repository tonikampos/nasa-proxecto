import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-grid',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.css'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule]
})
export class ImageGridComponent {
  @Input() displayedColumns: string[] = ['title', 'date', 'actions'];
  @Output() rowClick = new EventEmitter<string>();
  
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  @Input() set images(data: any[]) {
    this.dataSource = new MatTableDataSource<any>(data);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  
  ngAfterViewInit() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }
  
  onRowClick(id: string): void {
    this.rowClick.emit(id);
  }
}
