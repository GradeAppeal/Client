import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { filter, map, take } from 'rxjs';

export const setPasswordGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return new Promise<boolean | UrlTree>((resolve, reject) => {
    authService
      .getCurrentUser()
      .pipe(
        filter((val) => val !== null), // Filter out initial Behavior subject value
        take(1), // Otherwise the Observable doesn't complete!
        map(async (authUser) => {
          if (authUser && typeof authUser !== 'boolean') {
            const { email } = authUser;
            const role = await authService.getRole(email);

            // only resolve if a student
            role === 'student'
              ? resolve(true)
              : resolve(router.createUrlTree(['/']));
          } else {
            resolve(router.createUrlTree(['/']));
          }
        })
      )
      .subscribe();
  });
};
