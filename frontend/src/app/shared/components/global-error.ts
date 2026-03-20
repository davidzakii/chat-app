import { Component, effect, Inject, inject, OnInit } from '@angular/core';
import { ErrorService } from '../../core/services/error.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-global-error',
  imports: [],
  template: ``,
})
export class GlobalError {
  private readonly errors = inject(ErrorService);

  constructor() {
    effect(() => {
      if (this.errors.error()) {
        toast.error(this.errors.error()!.message);
        this.errors.clear();
      }
    });
  }
}
