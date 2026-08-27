export interface CreateMonevRequest {
  kodeLogbook: string;
  date: string;
  timeStart: string;
  timeEnd: string;
}

export interface MonevResponse {
  id: number;
  kodeLogbook: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MonevListResponse {
  data: MonevResponse[];
  total: number;
}

export interface MonevItem {
  date: string;
  timeStart: string;
  timeEnd: string;
  roomUrl: string;
  kodeLogbook: string;
  idShared?: number;
  shared?: {
    idShared: number;
    sharedWith: string;
    permission: string;
  };
}

export interface MonevResponse {
  data: MonevItem[];
  total: number;
}

export interface MonevWithLogbookItem {
  idMonev: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  roomUrl: string;
  kodeLogbook: string;
  idShared: number;
  logbookContent: string;
  logbookDateStart: string;
  logbookDateEnd: string;
  logbookDeskripsi: string;
  logbookUsername: string;
  logbookImageUrl: string;
  logbookStatus: string;
  logbookTotalDateRange: number;
  logbookTotalLogbookDetails: number;
  sharedWith: string;
  permission: string;
  userNama: string | null;
  userEmail: string | null;
}

export interface MonevWithLogbookResponse {
  message: string;
  totalData: number;
  username: string;
  data: MonevWithLogbookItem[];
}

export interface MonevItem {
  date: string;
  timeStart: string;
  timeEnd: string;
  roomUrl: string;
  kodeLogbook: string;
  idShared?: number;
  shared?: {
    idShared: number;
    sharedWith: string;
    permission: string;
  };
}

export interface MonevResponse {
  data: MonevItem[];
  total: number;
}
