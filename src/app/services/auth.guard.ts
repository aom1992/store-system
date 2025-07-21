import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const auth = new AuthService();
  if (auth.isLoggedIn()) {
    return true;
  } else {
    window.alert('กรุณา Login เข้าสู่ระบบ !');
    return inject(Router).createUrlTree(['/login']);
  };
}