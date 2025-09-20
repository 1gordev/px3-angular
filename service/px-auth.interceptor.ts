import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PxAuthService } from './px-auth.service';

// Configuration type for excluded paths
interface AuthInterceptorConfig {
    excludedPaths: string[];
}

// Factory function to create the interceptor with config
export function pxAuthInterceptor(config: AuthInterceptorConfig = { excludedPaths: [] }): (req: HttpRequest<unknown>, next: HttpHandlerFn) => Observable<HttpEvent<unknown>> {
    // Ensure default excluded paths are always present
    const excludedPaths = [
        ...config.excludedPaths,
        '/token',
        '/token/refresh'
    ].filter((path, index, self) => self.indexOf(path) === index); // Remove duplicates

    // The functional interceptor
    return (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
        // Inject the auth service lazily
        const authService = inject(PxAuthService);

        // Check if the request URL is excluded
        const isExcluded = excludedPaths.some(path => req.url.includes(path));
        if (isExcluded) {
            return next(req);
        }

        // Get the access token and clone the request if it exists
        const accessToken = authService.getAccessToken();
        let authReq = req;
        if (accessToken) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
        }

        // Handle the request and catch errors
        return next(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401 && error.error?.message === 'Token has expired') {
                    const refreshToken = authService.getRefreshToken();

                    if (refreshToken) {
                        return from(authService.refresh()).pipe(
                            switchMap((success: boolean) => {
                                if (success) {
                                    const newAccessToken = authService.getAccessToken();
                                    const newAuthReq = req.clone({
                                        setHeaders: {
                                            Authorization: `Bearer ${newAccessToken}`
                                        }
                                    });
                                    return next(newAuthReq);
                                } else {
                                    authService.logout();
                                    window.location.reload();
                                    return throwError(() => new Error('Token refresh failed'));
                                }
                            })
                        );
                    } else {
                        authService.logout();
                        window.location.reload();
                        return throwError(() => error);
                    }
                }

                return throwError(() => error);
            })
        );
    };
}
