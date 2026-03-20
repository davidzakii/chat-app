import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiSuccessResponse } from '../models/api.response.model';
import { UserDTO } from '../models/user.model';
import { PROFILE_API } from '../api/profile.api';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  updateProfile(fullName: string, image?: File | null) {
    const formData = new FormData();
    formData.append('fullName', fullName);
    if (image) {
      formData.append('profilePic', image);
    }

    return this.api.patch<ApiSuccessResponse<UserDTO>>(PROFILE_API.updateProfile, formData).pipe(
      tap((res) => {
        // Sync updated user into auth state
        this.auth.updateCurrentUser(res.data);
      }),
    );
  }
}
