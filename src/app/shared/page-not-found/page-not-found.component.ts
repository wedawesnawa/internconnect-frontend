import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { CardComponent } from '../card/card.component';
import { CarouselComponent } from '../carousel/carousel.component';
import { ContentComponent } from '../content/content.component';
import { FileInputComponent } from '../file-input/file-input.component';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { ModalComponent } from '../modal/modal.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, CardComponent, CarouselComponent, ContentComponent, FileInputComponent, FooterComponent, HeaderComponent, ModalComponent, SidebarComponent],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  title = 'web-app';

}
