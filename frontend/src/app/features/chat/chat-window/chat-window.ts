import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { DatePipe, NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { MessageInput } from '../message-input/message-input';
import { MessageAttachmentDTO } from '../../../core/models/message.model';
@Component({
  selector: 'app-chat-window',
  imports: [NgClass, DatePipe, MessageInput],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatWindow {
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  isShowImage: boolean = false;
  isShowDialog: boolean = false;
  isEditedMessage: boolean = false;
  currentFullImage: string = '';
  readonly messagesState = this.messages.state;
  readonly authState = this.auth.state;
  msgId: string = '';
  editText: string = '';
  editFile: MessageAttachmentDTO[] = [];
  showDialog(id: string, text: string, files: MessageAttachmentDTO[]) {
    this.msgId = id;
    this.editText = text;
    this.editFile = files;
    this.isShowDialog = !this.isShowDialog;
  }
  private scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  private scrollToBottom() {
    this.cdr.detectChanges();
    const lastMsg = document.getElementById('lastMessage');
    if (lastMsg) {
      lastMsg.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }

  constructor() {
    effect(() => {
      const messages = this.messagesState().messages;
      const container = this.scrollContainer();

      if (messages.length > 0 && container) {
        setTimeout(() => {
          const scrollEl = container.nativeElement;
          scrollEl.scrollTop = scrollEl.scrollHeight + 1000;
          this.scrollToBottom();
        }, 100);
      }
    });
  }
  readonly skeletonItems = Array.from({ length: 5 });
  readonly currentUserId = computed(() => this.authState().status.userId ?? '');

  readonly selectedUserName = computed(() => {
    const userId = this.messagesState().selectedUserId;
    return this.messagesState().users.find((u) => u._id === userId)?.fullName ?? 'Conversation';
  });

  readonly currentUser = computed(() => {
    return this.authState().currentUser;
  });

  readonly currentUserName = computed(() => {
    const name = this.currentUser()?.fullName!;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  });

  readonly otherInitials = computed(() => {
    const name = this.selectedUserName();
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  });

  openImage(url: string) {
    this.currentFullImage = url;
    this.isShowImage = true;
  }
  readonly imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];

  isImage(url: string): boolean {
    const ext = this.getFileExtension(url);
    return this.imageExtensions.includes(ext.toLowerCase());
  }

  getFileExtension(url: string): string {
    return url.split('.').pop()?.split('?')[0] || '';
  }

  getFileIcon(url: string): string {
    const ext = this.getFileExtension(url).toLowerCase();
    if (ext === 'pdf') return 'file-text';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    if (['doc', 'docx'].includes(ext)) return 'file-edit';
    return 'file';
  }
  deleteMessage() {
    this.messages
      .deleteMessage(this.msgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          toast.success('Deleted message success');
        },
      });
  }
  editMessage() {
    this.isEditedMessage = true;
  }

  handleEditCompleted() {
    this.msgId = '';
    this.editText = '';
    this.editFile = [];
    this.isEditedMessage = false;
  }
}
