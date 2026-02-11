import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common'; // أضفه لقص أسماء الملفات الطويلة
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInput {
  private readonly messages = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('fileInput', { static: false })
  fileInput?: ElementRef<HTMLInputElement>;

  text = '';
  files: File[] = [];
  filePreviews: { url: string; isImage: boolean; name: string }[] = [];

  get canSend(): boolean {
    const state = this.messages.state();
    return !!state.selectedUserId && (!!this.text.trim() || this.files.length > 0);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newFiles = Array.from(input.files);
    this.files = [...this.files, ...newFiles];

    const newPreviews = newFiles.map((file) => {
      const isImage = file.type.startsWith('image/');
      return {
        url: isImage ? URL.createObjectURL(file) : '',
        isImage: isImage,
        name: file.name,
      };
    });

    this.filePreviews = [...this.filePreviews, ...newPreviews];
  }

  removeFile(index: number): void {
    const preview = this.filePreviews[index];
    if (preview.isImage && preview.url) {
      URL.revokeObjectURL(preview.url);
    }

    this.files.splice(index, 1);
    this.filePreviews.splice(index, 1);
    if (this.files.length === 0 && this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSend(): void {
    const state = this.messages.state();
    if (!state.selectedUserId || !this.canSend) return;

    const textToSend = this.text.trim();
    const filesToSend = [...this.files];
    this.text = '';
    this.files = [];
    this.filePreviews = [];
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.messages
      .sendMessage(state.selectedUserId, textToSend, filesToSend)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((r) => {
        this.filePreviews.forEach((preview) => {
          if (preview.isImage && preview.url) {
            URL.revokeObjectURL(preview.url);
          }
        });
        this.filePreviews = [];
      });
  }
}
