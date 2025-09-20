import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {inject} from "@angular/core";

export abstract class PxRestCrudBase<T, K> {

    // Define the base URL for the REST endpoints.
    protected abstract baseUrl: string;
    protected abstract resourceName: string;

    protected http = inject(HttpClient);

    // GET /resource
    findAll(): Observable<T[]> {
        return this.http.get<T[]>(`${this.baseUrl}/${this.resourceName}`);
    }

    // POST /action/{name}
    action(name: string, params: any): Observable<T[]> {
        return this.http.post<T[]>(`${this.baseUrl}/${this.resourceName}/action/{name}`, params);
    }

    // GET /resource/{id}
    findById(id: K): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${this.resourceName}/${id}`);
    }

    // POST /resource/by-ids
    findByIds(ids: K[]): Observable<T[]> {
        return this.http.post<T[]>(`${this.baseUrl}/${this.resourceName}/by-ids`, ids);
    }

    // POST /resource
    create(entity: T): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${this.resourceName}`, entity);
    }

    // PUT /resource/{id}
    update(id: K, entity: T): Observable<T> {
        return this.http.put<T>(`${this.baseUrl}/${this.resourceName}/${id}`, entity);
    }

    // DELETE /resource/{id}
    delete(id: K): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${this.resourceName}/${id}`);
    }
}
