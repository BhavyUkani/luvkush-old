import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  if (auth.isLoggedIn()) {
    return router.createUrlTree(['/403']);
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
