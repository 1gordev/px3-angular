import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PxAuthResponse } from '@px/model/px-auth-response';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PxAuthRest {
    private http: HttpClient;

    constructor(http: HttpClient) {
        this.http = http;
    }

    login(username: string, password: string): Observable<PxAuthResponse> {
        const url = `${environment.authUrl}/token`;

        // Encode the username and password in Base64
        const credentials = btoa(`${username}:${password}`);

        // Set the Authorization header with the encoded credentials
        const headers = new HttpHeaders({
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        });

        // Perform the POST request
        return this.http.post<PxAuthResponse>(url, {}, { headers });
    }

    refresh(refreshToken: string): Observable<PxAuthResponse> {
        const url = `${environment.authUrl}/token/refresh`;

        // Set the Refresh-Token header
        const headers = new HttpHeaders({
            'Refresh-Token': refreshToken,
            'Content-Type': 'application/json'
        });

        // Perform the POST request to refresh the tokens
        return this.http.post<PxAuthResponse>(url, {}, { headers });
    }
}
