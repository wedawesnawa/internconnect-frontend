import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.css']
})
export class FileInputComponent {
  @Input() label: string = 'Upload File';
  @Input() accept: string = '*/*';
  @Input() maxSize: number = 5 * 1024 * 1024; // 5MB default
  @Input() multiple: boolean = false;
  @Input() required: boolean = false;
  @Output() fileChange = new EventEmitter<File | File[]>();
  @Output() fileError = new EventEmitter<string>();

  files: File[] = [];
  errorMessage: string = '';
  isDragging: boolean = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(fileList: File[]): void {
    this.errorMessage = '';
    const validFiles: File[] = [];

    for (const file of fileList) {
      // Cek ukuran file
      if (file.size > this.maxSize) {
        this.errorMessage = `File ${file.name} exceeds maximum size of ${this.maxSize / 1024 / 1024}MB`;
        this.fileError.emit(this.errorMessage);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      this.files = validFiles;
      if (this.multiple) {
        this.fileChange.emit(validFiles);
      } else {
        this.fileChange.emit(validFiles[0]);
      }
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
    if (this.files.length === 0) {
      this.fileChange.emit(null as any);
    } else if (this.multiple) {
      this.fileChange.emit(this.files);
    } else {
      this.fileChange.emit(this.files[0]);
    }
  }

  getFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  get fileList(): string {
    return this.files.map(f => f.name).join(', ');
  }
}
