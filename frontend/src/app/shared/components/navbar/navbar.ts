import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SidebarService } from '../../../core/services/sidebar';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly state = this.auth.state;
  private readonly messages = inject(MessageService);
  readonly messagesState = this.messages.state;
  private sidebarService = inject(SidebarService);
  isSideBarLeft: boolean = this.sidebarService.isCollapsed();
  changeSideBarDirection() {
    this.sidebarService.toggle();
    this.isSideBarLeft = this.sidebarService.isCollapsed();
  }
  readonly user = computed(() => this.state().currentUser);
  readonly userInitials = computed(() => {
    const user = this.user();
    if (!user?.fullName) return '?';
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  });

  onLogout(): void {
    this.auth
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
      });
  }
  readonly selectedUserName = computed(() => {
    const userId = this.messagesState().selectedUserId;
    return this.messagesState().users.find((u) => u._id === userId)?.fullName ?? 'Conversation';
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
}
