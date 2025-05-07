import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.css'],
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule]
})
export class ImageCardComponent {
  @Input() image: any;
}
