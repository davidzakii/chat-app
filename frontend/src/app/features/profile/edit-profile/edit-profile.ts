import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toast } from 'ngx-sonner';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  private readonly auth = inject(AuthService);
  private readonly profile = inject(ProfileService);
  private readonly destroyRef = inject(DestroyRef);

  readonly authState = this.auth.state;
  fullName = '';
  isSaving = false;
  previewUrl = '';
  private previewObjectUrl: string | null = null;
  private initialized = false;
  private selectedFile: File | null = null;

  constructor() {
    effect(() => {
      const user = this.authState().currentUser;
      if (user && !this.initialized) {
        this.fullName = user.fullName ?? '';
        this.previewUrl = user.profilePic ?? '';
        this.initialized = true;
      }
    });
    this.destroyRef.onDestroy(() => {
      if (this.previewObjectUrl) {
        URL.revokeObjectURL(this.previewObjectUrl);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.selectedFile = file;
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
    }
    this.previewObjectUrl = URL.createObjectURL(file);
    this.previewUrl = this.previewObjectUrl;
  }

  onSave(): void {
    const name = this.fullName.trim();
    if (!name) {
      toast.error('Full name is required.');
      return;
    }

    this.isSaving = true;
    this.profile
      .updateProfile(name, this.selectedFile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving = false;
          toast.success('Profile updated successfully.');
          this.selectedFile = null;
        },
        error: () => {
          this.isSaving = false;
          toast.error('Could not update profile. Please try again.');
        },
      });
  }
}
