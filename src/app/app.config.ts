import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
  PLATFORM_ID,
  inject,
  isDevMode,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';

// NgRx imports
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideRouterStore } from '@ngrx/router-store';

import { routes } from './app.routes';
import { reducers } from '../store';
import { AuthEffects } from '../store/auth/effects/auth.effects';

// Create an auth interceptor function
const authInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Check if running in browser before accessing localStorage
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  let token = null;
  // Only access localStorage in browser environment
  if (isBrowser) {
    token = localStorage.getItem('auth_token');
  }

  // If token exists, add it to the request headers
  if (token) {
    console.log('Adding token to request headers for URL:', req.url);
    // Clone the request and add the Authorization header with the token
    req = req.clone({
      setHeaders: {
        Authorization: `${process.env["BAREAR"]!}${token}`
      },
    });
  }

  // Pass the modified request to the next handler
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Configure HTTP client with the interceptor
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Add animations provider
    provideAnimations(),
    // Import ToastrModule using importProvidersFrom for ngx-toastr v19
    importProvidersFrom(
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        closeButton: true,
      })
    ),
    // NgRx providers
    provideStore(reducers),
    provideEffects([AuthEffects]),
    provideRouterStore(),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode in production
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, // If set to true, will include stack trace for every dispatched action
      traceLimit: 75, // Maximum stack trace frames to be stored (in case trace option was provided as true)
      connectInZone: true, // If set to true, the connection is established within the Angular zone
    }),
  ],
};
