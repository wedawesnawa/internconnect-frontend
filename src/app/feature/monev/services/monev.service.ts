import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import {
  MonevItem,
  MonevResponse,
  MonevWithLogbookResponse,

} from '../models/monev.model';

@Injectable({
  providedIn: 'root'
})
export class MonevService {
  constructor(private apiService: ApiService) {}

  /**
   * Get Monev by kodeLogbook
   * GET /Monev/{kodeLogbook}
   */
  getMonevByKodeLogbook(kodeLogbook: string): Observable<MonevItem[]> {
    console.log('=== GET MONTEV ===');
    console.log('KodeLogbook:', kodeLogbook);

    return this.apiService.get<MonevItem[]>(
      `Monev/monev-with-logbook`,
      undefined,
      { withCredentials: true }
    );
  }

  /**
   * Get all Monev (for admin/supervisor)
   */
  getMonevWithLogbook(username: string): Observable<MonevWithLogbookResponse> {
    console.log('=== GET MONTEV WITH LOGBOOK ===');
    console.log('Username:', username);

    return this.apiService.get<MonevWithLogbookResponse>(
      `Monev/monev-with-logbook?username=${username}`,
      undefined,
      { withCredentials: true }
    );
  }

}
