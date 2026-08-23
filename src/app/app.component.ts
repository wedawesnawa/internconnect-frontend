import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'web-app';

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    initFlowbite();

    const htmlElement = document.documentElement;
    htmlElement.classList.add('dark');
  }
}
