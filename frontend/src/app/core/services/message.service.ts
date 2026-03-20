import { Inject, Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { UserDTO } from '../models/user.model';
import { ChatState, MessageDTO } from '../models/message.model';
import { tap } from 'rxjs/operators';
import { ApiSuccessResponse } from '../models/api.response.model';
import { MESSAGE_API } from '../api/message.api';
import { EMPTY } from 'rxjs';
import { SocketService } from './socket.service';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly api = inject(ApiService);
  private readonly socket = inject(SocketService);
  private readonly _state = signal<ChatState>({
    users: [],
    usersLoading: false,
    messages: [],
    messagesLoading: false,
    selectedUserId: null,
    onlineUsers: [],
  });

  readonly state = this._state.asReadonly();

  constructor(@Inject('IS_BROWSER') private isBrowser: boolean) {
    if (isBrowser) {
      this.socket.connect();
      this.socket.onNewMessage((msg) => {
        const current = this._state();

        // المنطق الصحيح: لو المرسل هو الشخص اللي أنا فاتحه دلوقتي
        // أو لو أنا اللي بعت والشخص اللي استلم هو اللي أنا فاتحه (دي متغطية في الـ tap بس زيادة تأكيد)
        const isFromSelectedUser = msg.senderId === current.selectedUserId;

        if (isFromSelectedUser) {
          // تأكد إن الرسالة مش موجودة فعلاً (عشان ميتكررش الإرسال والـ socket مع بعض)
          const exists = current.messages.some((m) => m._id === msg._id);
          if (!exists) {
            this._state.update((s) => ({
              ...s,
              messages: [...s.messages, msg],
            }));
          }
        } else {
          // اختياري: ممكن هنا تحدث الـ Sidebar عشان تظهر Notification أو تنقل اليوزر لفوق
          // console.log('رسالة جديدة من مستخدم آخر:', msg.senderId);
        }
      });
      this.socket.onMessageUpdated((msg) => {
        this._state.update((s) => ({
          ...s,
          messages: s.messages.map((m) => (m._id === msg._id ? msg : m)),
        }));
      });
      // this.socket.onNewMessage((msg) => {
      //   const current = this._state();
      //   if (msg.senderId === current.selectedUserId) {
      //     this._state.update((s) => ({
      //       ...s,
      //       messages: [...s.messages, msg],
      //     }));
      //   }
      // });
      this.socket.onlineUsers((users) => {
        this._state.update((s) => ({
          ...s,
          onlineUsers: users,
        }));
      });
      this.socket.onMessageDeleted(({ messageId }) => {
        this._state.update((s) => ({
          ...s,
          messages: s.messages.filter((m) => m._id !== messageId),
        }));
      });
    }
  }

  loadUsers() {
    this._state.update((s) => ({ ...s, usersLoading: true }));
    if (!this.isBrowser) {
      this._state.update((s) => ({ ...s, usersLoading: false }));
      return EMPTY; // 👈 مهم جدًا
    }
    return this.api
      .get<ApiSuccessResponse<UserDTO[]>>(MESSAGE_API.users)
      .pipe(
        tap((users) =>
          this._state.update((s) => ({ ...s, users: users.data, usersLoading: false })),
        ),
      );
  }

  searchUsers(query: string) {
    return this.api.get<ApiSuccessResponse<UserDTO[]>>(`/message/search?name=${query}`);
  }

  addUserToSidebar(user: UserDTO) {
    this._state.update((s) => {
      const exists = s.users.some((u) => u._id === user._id);
      const userSummary: UserDTO = {
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      };
      return {
        ...s,
        users: exists ? s.users : [userSummary, ...s.users],
        selectedUserId: user._id,
      };
    });
  }

  selectUser(userId: string) {
    if (this._state().selectedUserId === userId) return;
    this._state.update((s) => ({
      ...s,
      selectedUserId: userId,
      messages: [],
      messagesLoading: true,
    }));

    return this.api
      .get<ApiSuccessResponse<MessageDTO[]>>(MESSAGE_API.getMessagebyUser(userId))
      .pipe(
        tap((messages) =>
          this._state.update((s) => ({
            ...s,
            messages: messages.data,
            messagesLoading: false,
          })),
        ),
      );
  }

  sendMessage(userId: string, text: string, files: File[]) {
    const formData = new FormData();
    formData.append('text', text);
    for (const file of files) {
      formData.append('files', file);
    }

    return this.api
      .post<ApiSuccessResponse<MessageDTO>>(MESSAGE_API.sendMessage(userId), formData)
      .pipe(
        tap((message) => {
          return this._state.update((s) => ({
            ...s,
            messages: [...s.messages, message.data],
          }));
        }),
      );
  }

  editMessage(messageId: string, text: string, files: File[]) {
    const formData = new FormData();
    formData.append('text', text);
    for (const file of files) {
      formData.append('files', file);
    }
    return this.api
      .patch<ApiSuccessResponse<MessageDTO>>(MESSAGE_API.editMessage(messageId), formData)
      .pipe(
        tap((message) => {
          this._state.update((s) => ({
            ...s,
            messages: s.messages.map((m) => (m._id === messageId ? message.data : m)),
          }));
        }),
      );
  }

  deleteMessage(messageId: string) {
    return this.api.delete<ApiSuccessResponse<null>>(MESSAGE_API.deleteMessage(messageId)).pipe(
      tap(() => {
        this._state.update((s) => ({
          ...s,
          messages: s.messages.filter((m) => m._id !== messageId),
        }));
      }),
    );
  }
}
