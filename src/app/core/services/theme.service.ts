import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() {
    this.detectPrefersDarkMode();
  }

  detectPrefersDarkMode(): void {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    this.setDarkMode(prefersDarkMode.matches);

    prefersDarkMode.addEventListener('change', (event) => {
      this.setDarkMode(event.matches);
    });
  }

  setDarkMode(isDarkMode: boolean): void {
    const htmlElement = document.documentElement;

    if (isDarkMode) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}
