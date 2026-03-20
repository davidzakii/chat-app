import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common'; // أضفه لقص أسماء الملفات الطويلة
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageAttachmentDTO } from '../../../core/models/message.model';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInput implements OnChanges {
  private readonly messages = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  @Input() editMsgId: string = '';
  @Input() initialText: string = '';
  @Input() initialFiles: MessageAttachmentDTO[] = [];
  @Output() editCompleted = new EventEmitter<void>();
  @ViewChild('fileInput', { static: false })
  fileInput?: ElementRef<HTMLInputElement>;

  text = '';
  files: File[] = [];
  filePreviews: {
    url: string;
    isImage: boolean;
    name: string;
    source: 'new' | 'existing';
    fileRef?: File;
  }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFiles']) {
      this.files = [];
      this.filePreviews = (this.initialFiles ?? []).map((file) => ({
        url: file.url,
        isImage: this.isImageUrl(file.url),
        name: file.name,
        source: 'existing',
      }));
      if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
      this.cdr.markForCheck();
    }
    if (changes['initialText']) {
      this.text = this.initialText ?? '';
      this.cdr.markForCheck();
    }
  }

  get canSend(): boolean {
    const state = this.messages.state();
    return !!state.selectedUserId && (!!this.text.trim() || this.filePreviews.length > 0);
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
        source: 'new' as const,
        fileRef: file,
      };
    });

    this.filePreviews = [...this.filePreviews, ...newPreviews];
  }

  removeFile(index: number): void {
    const preview = this.filePreviews[index];
    if (preview.isImage && preview.url && preview.source === 'new') {
      URL.revokeObjectURL(preview.url);
    }

    if (preview.source === 'new' && preview.fileRef) {
      this.files = this.files.filter((f) => f !== preview.fileRef);
    }
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
    if (this.editMsgId) {
      console.log(this.initialFiles);
      this.messages
        .editMessage(this.editMsgId, textToSend, filesToSend)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.resetComposer();
          this.editCompleted.emit();
        });
    } else {
      this.messages
        .sendMessage(state.selectedUserId, textToSend, filesToSend)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((r) => {
          this.resetComposer();
        });
    }
  }

  private resetComposer(): void {
    this.filePreviews.forEach((preview) => {
      if (preview.isImage && preview.url && preview.source === 'new') {
        URL.revokeObjectURL(preview.url);
      }
    });
    this.text = '';
    this.files = [];
    this.filePreviews = [];
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private isImageUrl(url: string): boolean {
    const ext = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    return !!ext && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(ext);
  }
}
