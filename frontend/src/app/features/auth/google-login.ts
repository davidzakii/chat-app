import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-google-login',
  standalone: true,
  template: ` <p>Signing you in with Google...</p> `,
})
export class GoogleLogin implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    this.router.navigate(['/chat']);
  }
}
