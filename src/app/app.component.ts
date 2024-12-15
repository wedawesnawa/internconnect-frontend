import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ThemeService } from './theme.service';
import { CommonModule } from '@angular/common';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LandingPageComponent, LoginComponent, RegisterComponent, CommonModule, RegisterComponent, PageNotFoundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'web-app';

  constructor(private themeService: ThemeService) {
    // ThemeService otomatis akan mendeteksi dan mengatur mode tema
  }
  // ngOnInit(): void {
  //   initFlowbite();
  // }
  ngOnInit() {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('dark');
  }
}


