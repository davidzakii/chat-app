import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
export function authInitializer(auth: AuthService) {
  return () => firstValueFrom(auth.checkAuth());
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        skipInitialTransition: true,
      }),
      withComponentInputBinding(), // Bind route params/data @Input
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withViewTransitions(), // Route transition animations (View Transitions API)
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]), // intercepting requests/responses
    ),
    provideClientHydration(
      withEventReplay(), // optional: replay clicks during hydration
      withIncrementalHydration(), // ✅ Incremental Hydration
    ),
    {
      provide: 'IS_BROWSER',
      useFactory: (platformId: Object) => isPlatformBrowser(platformId),
      deps: [PLATFORM_ID],
    },
    provideAppInitializer(() => authInitializer(inject(AuthService))()),
  ],
};
