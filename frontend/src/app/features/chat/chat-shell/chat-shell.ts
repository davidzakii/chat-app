import { ChangeDetectionStrategy, Component, computed, DestroyRef, Inject, inject, OnInit } from '@angular/core';
import { Sidebar } from '../sidebar/sidebar';
import { ChatWindow } from '../chat-window/chat-window';
import { MessageInput } from '../message-input/message-input';
import { MessageService } from '../../../core/services/message.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-shell',
  imports: [Sidebar, ChatWindow, MessageInput],
  templateUrl: './chat-shell.html',
  styleUrl: './chat-shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatShell implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly state = this.messages.state;
  readonly selectedUserId = computed(() => this.state().selectedUserId);

  constructor(@Inject('IS_BROWSER') public isBrowser: boolean) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      if (this.isBrowser) {
        this.messages.selectUser(id)?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
      }
    }
  }
}
