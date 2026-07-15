export type JenisKelamin = 'Laki-laki' | 'Perempuan';
export type StatusSiswa = 'Aktif' | 'Alumni' | 'Nonaktif';

export interface Siswa {
  id: string;
  nis: string;
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  kelas: string;
  tahunMasuk: number;
  status: StatusSiswa;
  alamat: string;
  noTelepon: string;
  tempatLahir: string;
  tanggalLahir: string;
}

export interface Absensi {
  id: string;
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  totalHari: number;
  persentaseKehadiran: number;
  semester: string;
  tahunAjaran: string;
}

export interface Nilai {
  id: string;
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  mataPelajaran: string;
  uh1: number | null;
  uh2: number | null;
  uh3: number | null;
  kt1: number | null;
  kt2: number | null;
  kt3: number | null;
  stsGanjil: number | null;
  stsGenap: number | null;
  sasGanjil: number | null;
  sasGenap: number | null;
  semester: string;
  tahunAjaran: string;
}

export interface TransaksiTabungan {
  id: string;
  siswaId: string;
  tanggal: string;
  jenis: 'setor' | 'tarik';
  jumlah: number;
  keterangan: string;
}

export interface Tabungan {
  id: string;
  siswaId: string;
  nis: string;
  nama: string;
  kelas: string;
  totalSetoran: number;
  totalPenarikan: number;
  saldoAkhir: number;
  frekuensiTransaksi: number;
  tahun: number;
  transaksi: TransaksiTabungan[];
}

export type MenuItem = 'siswa' | 'absensi' | 'nilai' | 'tabungan' | 'backup';

export interface AppState {
  siswa: Siswa[];
  absensi: Absensi[];
  nilai: Nilai[];
  tabungan: Tabungan[];
}
