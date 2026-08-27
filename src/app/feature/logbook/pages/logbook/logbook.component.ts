import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AlertService } from '../../../../shared/services/alert.service';
import { LogbookService } from '../../services/logbook.service';
import { LogbookResponse, LogbookStatus } from '../../models/logbook.model';

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
  logbooks: LogbookResponse[] = [];
  isModalOpen = false;
  loading = false;
  logbookForm: FormGroup;
  isEditing = false;
  editingKode: string | null = null;
  selectedFile: File | null = null;
  fileName: string = '';
  isSubmitting = false;

  isMonevModalOpen = false;
  monevForm: FormGroup;
  selectedKodeLogbook: string | null = null;
  isSubmittingMonev = false;

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private logbookService: LogbookService
  ) {
    this.logbookForm = this.formBuilder.group({
      content: ['', [Validators.required, Validators.minLength(3)]],
      dateStart: ['', [Validators.required]],
      dateEnd: ['', [Validators.required]],
      deskripsi: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.monevForm = this.formBuilder.group({
      date: ['', [Validators.required]],
      timeStart: ['', [Validators.required]],
      timeEnd: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadLogbooks();
  }

  loadLogbooks(): void {
    this.loading = true;
    this.logbookService.getMyLogbooks().subscribe({
      next: (data: LogbookResponse[]) => {
        console.log('My logbooks loaded:', data);
        console.log('Number of logbooks:', data.length);
        this.logbooks = data || [];
        this.loading = false;
        console.log('logbooks array:', this.logbooks);
      },
      error: (error: any) => {
        console.error('Error loading logbooks:', error);
        this.alertService.error(error.error?.message || 'Failed to load logbooks');
        this.loading = false;
      }
    });
  }

  get f() {
    return this.logbookForm.controls;
  }

  openModal(): void {
    console.log('Opening modal for CREATE');
    this.isModalOpen = true;
    this.isEditing = false;
    this.editingKode = null;
    this.selectedFile = null;
    this.fileName = '';
    this.logbookForm.reset();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedFile = null;
    this.fileName = '';
    this.logbookForm.reset();
    this.isEditing = false;
    this.editingKode = null;
  }

  editLogbook(logbook: LogbookResponse): void {
    console.log('=== EDITING LOGBOOK ===');
    console.log('Logbook data:', logbook);
    console.log('Logbook kodeLogbook:', logbook.kodeLogbook);

    if (!logbook.kodeLogbook) {
      console.error('Invalid logbook kodeLogbook:', logbook);
      this.alertService.error('Cannot edit: Invalid logbook data');
      return;
    }

    this.isEditing = true;
    this.editingKode = logbook.kodeLogbook;

    console.log('isEditing:', this.isEditing);
    console.log('editingKode:', this.editingKode);

    this.logbookForm.patchValue({
      content: logbook.content || '',
      dateStart: this.formatDateForInput(logbook.dateStart),
      dateEnd: this.formatDateForInput(logbook.dateEnd),
      deskripsi: logbook.deskripsi || ''
    });

    console.log('Form values after patch:', this.logbookForm.value);
    this.isModalOpen = true;
  }

  deleteLogbook(kodeLogbook: string): void {
    if (confirm('Are you sure you want to delete this logbook?')) {
      this.logbookService.deleteLogbook(kodeLogbook).subscribe({
        next: () => {
          this.alertService.success('Logbook deleted successfully!');
          this.loadLogbooks();
        },
        error: (error: any) => {
          console.error('Error deleting logbook:', error);
          this.alertService.error(error.error?.message || 'Failed to delete logbook');
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
      console.log('File selected:', this.selectedFile.name, 'Size:', this.selectedFile.size);
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

    console.log('=== SUBMITTING LOGBOOK ===');
    console.log('isEditing:', this.isEditing);
    console.log('editingKode:', this.editingKode);
    console.log('Form values:', this.logbookForm.value);

    this.isSubmitting = true;
    this.loading = true;

    const formData = {
      content: this.logbookForm.value.content,
      dateStart: this.formatDateToISO(this.logbookForm.value.dateStart),
      dateEnd: this.formatDateToISO(this.logbookForm.value.dateEnd),
      status: LogbookStatus.ONGOING,
      deskripsi: this.logbookForm.value.deskripsi,
      image: this.selectedFile || undefined
    };

    console.log('Form Data to send:', formData);

    if (this.isEditing === true && this.editingKode) {
      // UPDATE mode - menggunakan kodeLogbook
      console.log('✅ UPDATE mode - Kode:', this.editingKode);

      this.logbookService.updateLogbook(this.editingKode, formData).subscribe({
        next: (response: LogbookResponse) => {
          console.log('Logbook updated:', response);
          this.alertService.success('Logbook updated successfully!');
          this.loading = false;
          this.isSubmitting = false;
          this.closeModal();
          this.loadLogbooks();
        },
        error: (error: any) => {
          console.error('Error updating logbook:', error);
          this.alertService.error(error.error?.message || 'Failed to update logbook');
          this.loading = false;
          this.isSubmitting = false;
        }
      });
    } else {
      // CREATE mode
      console.log('✅ CREATE mode');

      this.logbookService.createLogbook(formData).subscribe({
        next: (response: LogbookResponse) => {
          console.log('Logbook created:', response);
          this.alertService.success('Logbook created successfully!');
          this.loading = false;
          this.isSubmitting = false;
          this.closeModal();
          this.loadLogbooks();
        },
        error: (error: any) => {
          console.error('Error creating logbook:', error);
          this.alertService.error(error.error?.message || 'Failed to create logbook');
          this.loading = false;
          this.isSubmitting = false;
        }
      });
    }
  }

  private formatDateToISO(date: string): string {
    const d = new Date(date);
    return d.toISOString();
  }

  private formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Ongoing': 'bg-blue-100 text-blue-800',
      'On Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Monev
  openMonevModal(kodeLogbook: string): void {
    console.log('=== OPEN MONTEV MODAL ===');
    console.log('KodeLogbook:', kodeLogbook);

    this.selectedKodeLogbook = kodeLogbook;
    this.isMonevModalOpen = true;
    this.monevForm.reset();

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    this.monevForm.patchValue({
      date: today
    });
  }

  closeMonevModal(): void {
    this.isMonevModalOpen = false;
    this.selectedKodeLogbook = null;
    this.monevForm.reset();
    this.isSubmittingMonev = false;
  }

  onSubmitMonev(): void {
    if (this.monevForm.invalid) {
      Object.keys(this.monevForm.controls).forEach(key => {
        const control = this.monevForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.selectedKodeLogbook) {
      this.alertService.error('No logbook selected');
      return;
    }

    this.isSubmittingMonev = true;

    const payload = {
      kodeLogbook: this.selectedKodeLogbook,
      date: new Date(this.monevForm.value.date).toISOString(),
      timeStart: this.monevForm.value.timeStart + ':00',
      timeEnd: this.monevForm.value.timeEnd + ':00'
    };

    console.log('=== SUBMITTING MONTEV ===');
    console.log('Payload:', payload);

    this.logbookService.createMonev(payload).subscribe({
      next: (response) => {
        console.log('Monev created:', response);
        this.alertService.success('Monev created successfully!');
        this.isSubmittingMonev = false;
        this.closeMonevModal();
      },
      error: (error: any) => {
        console.error('Error creating monev:', error);
        this.alertService.error(error.error?.message || 'Failed to create monev');
        this.isSubmittingMonev = false;
      }
    });
  }

  get fMonev() {
    return this.monevForm.controls;
  }
}
