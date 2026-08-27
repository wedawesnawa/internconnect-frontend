import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  CreateLogbookRequest,
  UpdateLogbookRequest,
  LogbookResponse,
  LogbookListResponse,
  LogbookDetailResponse,
  DetailLogbookResponse,
  CreateDetailLogbookRequest,
  UpdateDetailLogbookRequest,
  CreateSharedRequest,
  SharedResponse,
} from '../models/logbook.model';
import {
  CreateMonevRequest,
  MonevResponse,
  MonevListResponse
} from '../../monev/models/monev.model';

@Injectable({
  providedIn: 'root'
})
export class LogbookService {
  constructor(private apiService: ApiService) {}

  /**
   * Create a new logbook
   */
  createLogbook(data: CreateLogbookRequest): Observable<LogbookResponse> {
    const formData = new FormData();
    formData.append('Content', data.content);
    formData.append('DateStart', data.dateStart);
    formData.append('DateEnd', data.dateEnd);
    formData.append('Status', data.status);
    formData.append('Deskripsi', data.deskripsi);

    if (data.image) {
      formData.append('Image', data.image, data.image.name);
    }

    return this.apiService.postFormData<LogbookResponse>('Logbook/create', formData, { withCredentials: true });
  }

  /**
   * Get all logbooks
   */
  // getLogbooks(params?: { page?: number; pageSize?: number; status?: string }): Observable<LogbookListResponse> {
  //   return this.apiService.get<LogbookListResponse>('Logbook/', params, { withCredentials: true });
  // }

  getMyLogbooks(): Observable<LogbookResponse[]> {
    return this.apiService.get<any>('Logbook/my-logbooks', undefined, { withCredentials: true }).pipe(
      map((response) => {
        console.log('Raw response from API:', response);

        // Jika response adalah array langsung
        if (Array.isArray(response)) {
          console.log('Response is array, using directly');
          return response as LogbookResponse[];
        }

        // Jika response adalah object dengan property data
        if (response && response.data && Array.isArray(response.data)) {
          console.log('Response has data property, using response.data');
          return response.data as LogbookResponse[];
        }

        // Jika response adalah object dengan property data yang berisi array
        if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
          console.log('Response has data.data property');
          return response.data.data as LogbookResponse[];
        }

        // Jika tidak ada yang cocok, return array kosong
        console.warn('Unknown response format:', response);
        return [];
      })
    );
  }


  /**
   * Get logbook by ID
   */
  getLogbookByKode(kodeLogbook: string): Observable<LogbookDetailResponse> {
    return this.apiService.get<LogbookDetailResponse>(`Logbook/${kodeLogbook}`, undefined, { withCredentials: true });
  }

  /**
   * Update logbook
   */
  updateLogbook(kodeLogbook: string, data: UpdateLogbookRequest): Observable<LogbookResponse> {
    const formData = new FormData();

    if (data.content) formData.append('Content', data.content);
    if (data.dateStart) formData.append('DateStart', data.dateStart);
    if (data.dateEnd) formData.append('DateEnd', data.dateEnd);
    if (data.status) formData.append('Status', data.status);
    if (data.deskripsi) formData.append('Deskripsi', data.deskripsi);
    if (data.image) formData.append('Image', data.image, data.image.name);

    return this.apiService.putFormData<LogbookResponse>(`Logbook/update/${kodeLogbook}`, formData, { withCredentials: true });
  }

  /**
   * Delete logbook
   */
  deleteLogbook(kodeLogbook: string): Observable<any> {
    return this.apiService.delete(`Logbook/delete/${kodeLogbook}`, { withCredentials: true });
  }

  // Detail Logbook

  getDetailLogbooks(kodeLogbook: string): Observable<DetailLogbookResponse[]> {
    return this.apiService.get<DetailLogbookResponse[]>(
      `DetailLogbook/${kodeLogbook}/all`,
      undefined,
      { withCredentials: true }
    );
  }

  createDetailLogbook(kodeLogbook: string, data: CreateDetailLogbookRequest): Observable<DetailLogbookResponse> {
    return this.apiService.post<DetailLogbookResponse>(
      `DetailLogbook/${kodeLogbook}/create`,
      data,
      { withCredentials: true }
    );
  }

  getDetailLogbookById(id: number): Observable<DetailLogbookResponse> {
    return this.apiService.get<DetailLogbookResponse>(
      `DetailLogbook/${id}`,
      undefined,
      { withCredentials: true }
    );
  }

  updateDetailLogbook(id: number, data: UpdateDetailLogbookRequest): Observable<DetailLogbookResponse> {
    return this.apiService.put<DetailLogbookResponse>(
      `DetailLogbook/${id}/update`,
      data,
      { withCredentials: true }
    );
  }

  // Share logbook
  shareLogbook(kodeLogbook: string, data: CreateSharedRequest): Observable<SharedResponse> {
    return this.apiService.post<SharedResponse>(
      `Shared/${kodeLogbook}/create`,
      data,
      { withCredentials: true }
    );
  }

  getSharedLogbooks(kodeLogbook: string): Observable<SharedResponse[]> {
    return this.apiService.get<SharedResponse[]>(
      `Shared/${kodeLogbook}/all`,
      undefined,
      { withCredentials: true }
    );
  }

  deleteSharedLogbook(kodeLogbook: string, idShared: number): Observable<any> {
    console.log('=== DELETE SHARED LOGBOOK ===');
    console.log('KodeLogbook:', kodeLogbook);
    console.log('ID Shared:', idShared);
    console.log('Endpoint:', `Shared/${kodeLogbook}/delete/${idShared}`);

    return this.apiService.delete(
      `Shared/${kodeLogbook}/delete/${idShared}`,
      { withCredentials: true }
    );
  }

  // Monev
  createMonev(data: CreateMonevRequest): Observable<MonevResponse> {
    console.log('=== CREATE MONTEV ===');
    console.log('Payload:', data);

    return this.apiService.post<MonevResponse>(
      'Monev/ajukan-monev',
      data,
      { withCredentials: true }
    );
  }
}
