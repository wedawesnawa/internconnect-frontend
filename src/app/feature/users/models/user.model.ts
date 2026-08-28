export interface RelationItem {
  kodeLogbook: string;
  content: string;
  dateStart: string;
  dateEnd: string;
  status: string;
  deskripsi: string;
  imageUrl: string | null;
  sharedBy: string;
  sharedTo?: string;   
  sharedAt: string;
  permission: string;
}

export interface RelationResponse {
  receivedFromOthers: RelationItem[];
  givenToOthers: RelationItem[];
}
