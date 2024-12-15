import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular'; // FullCalendar module
import dayGridPlugin from '@fullcalendar/daygrid'; // For the day grid view
import timeGridPlugin from '@fullcalendar/timegrid'; // For the week and day views
import listPlugin from '@fullcalendar/list'; // For the list view
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-detail-logbook',
  standalone: true,
  imports: [FullCalendarModule], // Import FullCalendarModule
  templateUrl: './detail-logbook.component.html',
  styleUrls: ['./detail-logbook.component.css']
})
export class DetailLogbookComponent {
  calendarOptions: any;
  selectedDate: string = '';

  constructor() {
    // Generate events for each weekday in November 2024, skipping Saturdays and Sundays
    const events = [];
    const startDate = new Date(2024, 10, 1); // November 1, 2024
    const endDate = new Date(2024, 10, 30);  // November 30, 2024

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        const dateStr = d.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
        events.push({
          title: 'PKL Shift - Software House',   // Event title for PKL shift
          start: `${dateStr}T08:00:00`,          // Start at 8:00 AM
          end: `${dateStr}T17:00:00`,            // End at 5:00 PM
          description: 'Mahasiswa PKL bekerja di software house' // Event description
        });
      }
    }

    // Set FullCalendar options here
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
      initialView: 'dayGridMonth', // Show month view
      headerToolbar: {
        left: 'prev,next today', // Navigation buttons
        center: 'title',         // Title in the center
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' // Available views: Month, Week, Day, List
      },
      editable: true,              // Allow editing (dragging, resizing)
      selectable: true,            // Allow date selection
      events: events,              // Add the generated events
      dateClick: this.handleDateClick.bind(this) // Bind dateClick event
    };
  }

  // Function to handle date click
  handleDateClick(arg: any) {
    this.selectedDate = arg.dateStr; // Store the clicked date
    const modal = document.getElementById('dateModal'); // Get the modal element
    modal?.classList.remove('hidden'); // Show the modal
  }

  // Function to close the modal
  closeModal() {
    const modal = document.getElementById('dateModal'); // Get the modal element
    modal?.classList.add('hidden'); // Hide the modal
  }
}
