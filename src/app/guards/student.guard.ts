import {
  CanActivateChildFn,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { filter, map, take } from 'rxjs';

export const studentGuard: CanActivateChildFn | CanActivateFn = async (
  route,
  state
) => {
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
            // only allow access for student accounts
            // if professor attempts to access student view, redirect to appeal inbox
            role === 'student'
              ? resolve(true)
              : resolve(router.createUrlTree(['/professor/appeal-inbox']));
          } else {
            resolve(router.createUrlTree(['/']));
          }
        })
      )
      .subscribe();
  });
};
