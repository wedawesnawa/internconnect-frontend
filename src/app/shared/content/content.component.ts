import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { LogbookComponent } from '../../pages/logbook/logbook.component';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, LogbookComponent],
  templateUrl: './content.component.html',
  styleUrl: './content.component.css'
})
export class ContentComponent {

}
