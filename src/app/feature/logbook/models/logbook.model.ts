// Request Models
export interface CreateLogbookRequest {
  content: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  deskripsi: string;
  image?: File;
}

export interface UpdateLogbookRequest {
  content?: string;
  dateStart?: string;
  dateEnd?: string;
  status?: string;
  deskripsi?: string;
  image?: File;
}

// Response Models
export interface LogbookResponse {
  id: number;
  content: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  deskripsi: string;
  imageUrl?: string;
  kodeLogbook?: string;
  totalDateRange?: number;
  totalLogbookDetails?: number;
  user?: any;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

export interface LogbookListResponse {
  data: LogbookResponse[];
  total: number;
  page?: number;
  pageSize?: number;
}

// Enum Status
export enum LogbookStatus {
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  LEGGING = 'Legging',
}


export interface CreateDetailLogbookRequest {
  date: string;
  deskripsi: string;
  kendala: string;
  statusAttend: string;
  timeStart: string;
  timeEnd: string;
  status: string;
}

export interface DetailLogbookResponse {
  id: number;
  date: string;
  deskripsi: string;
  kendala: string;
  statusAttend: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  kodeLogbook?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum DetailLogbookStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  LEAVE = 'Leave'
}

export interface LogbookDetailResponse {
  message: string;
  data: LogbookResponse;
}

export interface UpdateDetailLogbookRequest {
  date: string;
  deskripsi: string;
  kendala: string;
  statusAttend: string;
  timeStart: string; // Format: "HH:MM:SS"
  timeEnd: string;   // Format: "HH:MM:SS"
  status: string;
}
