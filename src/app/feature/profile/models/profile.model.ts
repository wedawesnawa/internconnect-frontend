export interface Profile {
  userId: number;
  nama: string;
  telp: string;
  bio: string;
  alamat: string;
  instansi: string;
  alamatInstansi: string;
  profileUrl: string;
  fileUrl: string | null;
  username: string;
}

export interface UpdateProfileRequest {
  nama: string;
  telp: string;
  bio: string;
  alamat: string;
  instansi: string;
  alamatInstansi: string;
}
