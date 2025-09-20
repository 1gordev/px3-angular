import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, firstValueFrom} from 'rxjs';
import {PxUser} from '../model/px-user';
import {PxAuthRest} from './rest/px-auth-rest';
import {PxAuthResponse} from '../model/px-auth-response';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class PxAuthService {
    private readonly authRest = inject(PxAuthRest);
    private readonly currentUser$ = new BehaviorSubject<PxUser | null>(null);
    private readonly router = inject(Router);


    constructor() {
        setTimeout(() => {
            // Initialize current user from session storage or cookie
            const accessToken = this.getAccessToken();
            const refreshToken = this.getRefreshToken();

            if (accessToken && refreshToken) {
                this.refresh().then();
            } else {
                this.currentUser$.next(null);
            }
        }, 1);
    }

    get currentUser(): BehaviorSubject<PxUser | null> {
        return this.currentUser$;
    }

    get isRoot(): boolean {
        return this.currentUser$.value?.roles?.includes('ROOT') || false;
    }

    public async login(username: string, password: string, requiredRoles: string[] = []): Promise<PxUser | null> {
        this.clearTokens();
        try {
            const authResponse = await firstValueFrom(this.authRest.login(username, password));
            await this.handleAuthResponse(authResponse, requiredRoles);
            return this.currentUser$.value;
        } catch (error) {
            console.error('Login failed', error);
            return null;
        }
    }

    public async refresh(): Promise<boolean> {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
            try {
                const authResponse = await firstValueFrom(this.authRest.refresh(refreshToken));
                await this.handleAuthResponse(authResponse, []);
                return true;
            } catch (error) {
                console.error('Token refresh failed', error);
                this.logout();
                return false;
            }
        } else {
            this.logout();
            return false;
        }
    }

    public getTimeZoneId(): string {
        return 'Europe/Rome';
    }

    public getShortDateFormatForMoment(): string {
        return 'DD.MM.YYYY';
    }

    public logout(): void {
        this.currentUser$.next(null);
        this.clearTokens();
        this.router.navigate(['/auth/login']);
    }

    public getRefreshToken(): string | null {
        // debugger;
        const match = document.cookie.match(new RegExp('(^| )refresh_token=([^;]+)'));
        return match ? match[2] : null;
    }

    public getAccessToken(): string | null {
        return sessionStorage.getItem('access_token');
    }

    private async handleAuthResponse(authResponse: PxAuthResponse, requiredRoles: string[]): Promise<void> {
        if (authResponse.user && authResponse.accessToken && authResponse.refreshToken) {
            this.storeTokens(authResponse.accessToken, authResponse.refreshToken);

            this.currentUser$.next(authResponse.user);

            if (!this.isRoot && !this.checkRequiredRolesOnLogin(this.currentUser$.value, requiredRoles)) {
                setTimeout(() => this.router.navigate(['/auth/access-denied']));
            }
        }
    }

    private storeTokens(accessToken: string, refreshToken: string): void {
        sessionStorage.setItem('access_token', accessToken);
        document.cookie = `refresh_token=${refreshToken}; Secure; SameSite=Lax; path=/`;
    }

    private clearTokens(): void {
        sessionStorage.removeItem('access_token');
        document.cookie = 'refresh_token=; Max-Age=0; path=/';
    }

    private checkRequiredRolesOnLogin(value: PxUser | null, requiredRoles: string[]):boolean {
        if(!requiredRoles || requiredRoles.length === 0) {
            // No roles required, allow access
            return true;
        } else {
            if (!value || !value.roles) {
                // No user or roles available, deny access
                return false;
            }
            // Check if the user has at least one of the required roles
            return requiredRoles.some(role => value.roles.includes(role));
        }
    }
}
