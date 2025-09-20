import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {PxAuthService} from "../service/px-auth.service";

export const PxAuthGuard: CanActivateFn = (route, state) => {
    const authService: PxAuthService = inject(PxAuthService);
    const router = inject(Router);

    // Check if the user is authenticated
    const isAuthenticated = authService.getAccessToken() !== null;

    if (isAuthenticated) {
        // User is authenticated, allow access
        return true;
    } else {
        // User is not authenticated, redirect to the login page
        router.navigate(['/auth/login'], {
            queryParams: {
                returnUrl: state.url
            }
        });
        return false;
    }
};
