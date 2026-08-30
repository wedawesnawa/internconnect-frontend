import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  get<T>(endpoint: string, params?: any, options?: { withCredentials?: boolean }): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      headers: this.getHeaders(),
      withCredentials: options?.withCredentials || false
    });
  }
  getBlob(endpoint: string, options?: { withCredentials?: boolean }): Observable<Blob> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log('getBlob URL:', url);
    return this.http.get(url, {
      responseType: 'blob',
      withCredentials: options?.withCredentials || false
    });
  }

  post<T>(endpoint: string, data: any, options?: { withCredentials?: boolean }): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: options?.withCredentials || false
    });
  }

  put<T>(endpoint: string, data: any, options?: { withCredentials?: boolean }): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: options?.withCredentials || false
    });
  }

  delete<T>(endpoint: string, options?: { withCredentials?: boolean }): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: options?.withCredentials || false
    });
  }

  patch<T>(endpoint: string, data: any, options?: { withCredentials?: boolean }): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: options?.withCredentials || false
    });
  }
  postFormData<T>(endpoint: string, formData: FormData, options?: { withCredentials?: boolean }): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, formData, {
      withCredentials: options?.withCredentials || false,
    });
  }
  putFormData<T>(endpoint: string, formData: FormData, options?: { withCredentials?: boolean }): Observable<T> {
    const headers = new HttpHeaders();
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, formData, {
      headers: headers,
      withCredentials: options?.withCredentials || false,
      reportProgress: true
      // Jangan set Content-Type, biarkan browser yang set dengan boundary
    });
  }
}
