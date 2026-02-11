import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserDTO } from '../../../core/models/user.model';
import { debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar implements OnInit {
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();
  searchResults = signal<UserDTO[]>([]);
  readonly state = this.messages.state;
  readonly skeletonItems = Array.from({ length: 6 });

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => (query ? this.messages.searchUsers(query) : of({ data: [] }))),
      )
      .subscribe((res) => this.searchResults.set(res.data));
  }
  onSearch(event: any) {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  selectSearchResult(user: UserDTO) {
    this.messages.addUserToSidebar(user);
    this.searchResults.set([]); // إخفاء القائمة بعد الاختيار
    // توجيه المستخدم للشات
    this.router.navigate(['/chat', user._id]);
  }

  ngOnInit(): void {
    this.messages
      .loadUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {});
  }

  openChat(userId: string): void {
    this.messages.selectUser(userId)?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.router.navigate(['/chat', userId]);
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}
