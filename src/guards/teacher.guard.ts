import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';
import { map } from 'rxjs';

export const teacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggingService);

  logger.debug('Teacher guard checking authorization');

  return authService.currentUser$.pipe(
    map((user) => {
      // Check if user exists and has role of teacher
      const isTeacher = !!user && user.role === 'teacher';

      if (!isTeacher) {
        logger.warn('Access denied - Not a teacher');
        router.navigate(['/login'], {
          queryParams: {
            returnUrl: state.url,
            message: 'You must be logged in as a teacher to access this page',
          },
        });
        return false;
      }

      logger.debug('Teacher guard granted access');
      return true;
    })
  );
};
