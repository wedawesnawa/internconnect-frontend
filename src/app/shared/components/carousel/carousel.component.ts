import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() autoPlay: boolean = true;
  @Input() interval: number = 3000;
  @Input() showIndicators: boolean = true;
  @Input() showControls: boolean = true;

  currentIndex: number = 0;
  private intervalId: any;

  ngOnInit(): void {
    if (this.autoPlay && this.images.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      this.next();
    }, this.interval);
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  prev(): void {
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.stopAutoPlay();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  next(): void {
    this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.stopAutoPlay();
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }
}
