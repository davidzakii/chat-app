import { Component, Inject, signal } from '@angular/core';
import { NgxSonnerToaster } from 'ngx-sonner';
import { GlobalError } from './shared/components/global-error';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NgxSonnerToaster, GlobalError, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  constructor(@Inject('IS_BROWSER') public isBrowser: boolean) {}
}
