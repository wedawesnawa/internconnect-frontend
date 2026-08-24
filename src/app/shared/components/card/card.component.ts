import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() imageUrl: string = '';
  @Input() imageAlt: string = '';
  @Input() imagePosition: 'top' | 'bottom' = 'top';
  @Input() hoverable: boolean = true;
  @Input() border: boolean = true;
  @Input() showImage: boolean = true;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
    const hoverClasses = this.hoverable ? 'transition-transform duration-200 hover:shadow-lg hover:-translate-y-1' : '';
    const borderClasses = this.border ? 'border border-gray-200' : '';
    return `${baseClasses} ${hoverClasses} ${borderClasses}`;
  }
}
