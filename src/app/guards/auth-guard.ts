import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  try{
    // If this succeeds, the user is logged in
    await authService.getCurrentUser();
    return true;
  }catch(error){
    // If it fails (session expired or not logged in), redirect to login
    router.navigate(['/login']);  
    return true;
  }
};
