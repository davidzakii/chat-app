import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-verify-otp',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtp {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly authState = this.auth.state;

  readonly email = this.route.snapshot.queryParamMap.get('email') ?? 'your email';

  readonly form = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.authState().loading) {
      return;
    }

    this.auth
      .verifyOtp({
        email: this.route.snapshot.queryParamMap.get('email') ?? '',
        otp: this.form.controls.otp.value,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
      });
  }
}
