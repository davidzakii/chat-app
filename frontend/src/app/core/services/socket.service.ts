import { Injectable, Inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { MessageDTO } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;

  constructor(
    private auth: AuthService,
    @Inject('IS_BROWSER') private isBrowser: boolean,
  ) {}

  connect() {
    if (!this.isBrowser || this.socket) return;
    const currentUser = this.auth.state().currentUser;
    this.socket = io('https://cuddly-silvia-webdeveloperog-1baa189a.koyeb.app', {
      withCredentials: true,
      query: {
        userId: currentUser?._id,
      },
    });

    this.socket.on('connect', () => {});
    this.onlineUsers((users: string[]) => {});
  }

  onlineUsers(cb: (users: string[]) => void) {
    this.socket.on('getOnlineUsers', cb);
  }

  onNewMessage(cb: (msg: MessageDTO) => void) {
    this.socket.on('newMessage', cb);
  }

  onMessageUpdated(cb: (msg: MessageDTO) => void) {
    this.socket.on('newMessage', cb);
  }

  onMessageDeleted(cb: (data: { messageId: string }) => void) {
    this.socket.on('messageUpdated', cb);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined as any;
  }
}
