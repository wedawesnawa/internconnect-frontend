import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AlertService } from '../../../../shared/services/alert.service';

export interface Logbook {
  id: number;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  status: string;
}

@Component({
  selector: 'app-logbook',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardComponent,
    ModalComponent
  ],
  templateUrl: './logbook.component.html',
  styleUrls: ['./logbook.component.css']
})
export class LogbookComponent implements OnInit {
  logbooks: Logbook[] = [];
  isModalOpen = false;
  loading = false;
  logbookForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {
    this.logbookForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      dateStart: ['', [Validators.required]],
      dateEnd: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadLogbooks();
  }

  loadLogbooks(): void {
    // Data dummy untuk contoh
    this.logbooks = [
      {
        id: 1,
        title: 'Logbook Project - Apple Watch Series 7 GPS',
        description: 'Development of Apple Watch Series 7 GPS application with focus on health tracking features.',
        dateStart: '01/11/2024',
        dateEnd: '05/11/2024',
        status: 'On Progress'
      },
      {
        id: 2,
        title: 'Mobile App Development - E-Commerce',
        description: 'Building a cross-platform e-commerce mobile application using Flutter.',
        dateStart: '10/11/2024',
        dateEnd: '20/11/2024',
        status: 'Completed'
      },
      {
        id: 3,
        title: 'Data Analysis Dashboard',
        description: 'Creating an interactive dashboard for data visualization using Angular and D3.js.',
        dateStart: '15/11/2024',
        dateEnd: '25/11/2024',
        status: 'Pending'
      }
    ];
  }

  get f() {
    return this.logbookForm.controls;
  }

  openModal(): void {
    this.isModalOpen = true;
    this.isEditing = false;
    this.editingId = null;
    this.logbookForm.reset();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.logbookForm.reset();
  }

  editLogbook(logbook: Logbook): void {
    this.isEditing = true;
    this.editingId = logbook.id;
    this.logbookForm.patchValue({
      title: logbook.title,
      dateStart: logbook.dateStart,
      dateEnd: logbook.dateEnd,
      description: logbook.description
    });
    this.isModalOpen = true;
  }

  deleteLogbook(id: number): void {
    if (confirm('Are you sure you want to delete this logbook?')) {
      this.logbooks = this.logbooks.filter(l => l.id !== id);
      this.alertService.success('Logbook deleted successfully!');
    }
  }

  onSubmit(): void {
    if (this.logbookForm.invalid) {
      Object.keys(this.logbookForm.controls).forEach(key => {
        const control = this.logbookForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const formData = {
      ...this.logbookForm.value,
      status: 'On Progress'
    };

    // Simulasi API call
    setTimeout(() => {
      if (this.isEditing && this.editingId) {
        // Update existing logbook
        const index = this.logbooks.findIndex(l => l.id === this.editingId);
        if (index !== -1) {
          this.logbooks[index] = {
            ...this.logbooks[index],
            ...formData
          };
          this.alertService.success('Logbook updated successfully!');
        }
      } else {
        // Add new logbook
        const newLogbook: Logbook = {
          id: this.logbooks.length + 1,
          ...formData
        };
        this.logbooks.push(newLogbook);
        this.alertService.success('Logbook created successfully!');
      }

      this.loading = false;
      this.closeModal();
    }, 1000);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'On Progress': 'bg-yellow-100 text-yellow-800 ',
      'Completed': 'bg-green-100 text-green-800 ',
      'Pending': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
