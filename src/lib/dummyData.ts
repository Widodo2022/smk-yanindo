import type { Siswa, Absensi, Nilai, Tabungan, TransaksiTabungan } from '@/types';

let idCounter = 0;
function generateId(): string {
  idCounter++;
  return `id_${Date.now()}_${idCounter}`;
}

const namaDepanLaki = ['Ahmad', 'Muhammad', 'Budi', 'Dedi', 'Eko', 'Fajar', 'Gilang', 'Hendra', 'Irfan', 'Joko', 'Kurniawan', 'Lukman', 'Maman', 'Nanda', 'Oscar', 'Putra', 'Qomar', 'Rizky', 'Sigit', 'Teguh', 'Umar', 'Vino', 'Wahyu', 'Yusuf', 'Zaki'];
const namaDepanPerempuan = ['Aisyah', 'Bella', 'Citra', 'Dewi', 'Eka', 'Fitri', 'Gita', 'Hani', 'Indah', 'Jelita', 'Kartika', 'Lestari', 'Maya', 'Nisa', 'Olivia', 'Putri', 'Qonita', 'Rani', 'Sari', 'Tika', 'Umi', 'Vanya', 'Wulan', 'Yuni', 'Zahra'];
const namaBelakang = ['Susanto', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Hidayat', 'Santoso', 'Nugroho', 'Setiawan', 'Prasetyo', 'Handoko', 'Suryadi', 'Gunawan', 'Sanjaya', 'Putri', 'Maulani', 'Rahmawati', 'Anggraini', 'Lestari', 'Oktaviani'];
const kelasList = ['X RPL 1', 'X RPL 2', 'X TKJ 1', 'X TKJ 2', 'X MM 1', 'X MM 2', 'XI RPL 1', 'XI RPL 2', 'XI TKJ 1', 'XI TKJ 2', 'XI MM 1', 'XI MM 2', 'XII RPL 1', 'XII RPL 2', 'XII TKJ 1', 'XII TKJ 2', 'XII MM 1', 'XII MM 2'];
const mataPelajaranList = ['Pemrograman Web', 'Basis Data', 'Pemrograman Berorientasi Objek', 'Jaringan Komputer', 'Desain Grafis', 'Sistem Operasi', 'Keamanan Jaringan', 'Multimedia', 'Pemrograman Mobile', 'Cloud Computing'];
const alamatJalan = ['Jl. Merdeka', 'Jl. Sudirman', 'Jl. Ahmad Yani', 'Jl. Diponegoro', 'Jl. Gatot Subroto', 'Jl. Pemuda', 'Jl. Pahlawan', 'Jl. Kartini', 'Jl. Imam Bonjol', 'Jl. Trunojoyo'];
const kota = ['Jakarta', 'Bandung', 'Surabaya', 'Semarang', 'Yogyakarta', 'Malang', 'Solo', 'Medan', 'Makassar', 'Palembang'];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

export function generateDummySiswa(count: number = 50): Siswa[] {
  const siswaList: Siswa[] = [];
  const usedNIS = new Set<string>();

  for (let i = 0; i < count; i++) {
    const isLaki = Math.random() > 0.4;
    const namaDepan = randomChoice(isLaki ? namaDepanLaki : namaDepanPerempuan);
    const namaBelakangVal = randomChoice(namaBelakang);
    const namaLengkap = `${namaDepan} ${namaBelakangVal}`;

    let nis: string;
    do {
      nis = `2023${String(randomInt(1, 999)).padStart(3, '0')}`;
    } while (usedNIS.has(nis));
    usedNIS.add(nis);

    const jenisKelamin = isLaki ? 'Laki-laki' as const : 'Perempuan' as const;
    const kelas = randomChoice(kelasList);
    const tahunMasuk = 2021 + randomInt(0, 3);
    const status = randomChoice(['Aktif', 'Aktif', 'Aktif', 'Aktif', 'Alumni', 'Nonaktif'] as const);

    siswaList.push({
      id: generateId(),
      nis,
      namaLengkap,
      jenisKelamin,
      kelas,
      tahunMasuk,
      status,
      alamat: `${randomChoice(alamatJalan)} No. ${randomInt(1, 100)}, ${randomChoice(kota)}`,
      noTelepon: `08${randomInt(1000000000, 9999999999)}`,
      tempatLahir: randomChoice(kota),
      tanggalLahir: randomDate(new Date(2005, 0, 1), new Date(2009, 11, 31)),
    });
  }

  return siswaList.sort((a, b) => a.namaLengkap.localeCompare(b.namaLengkap));
}

export function generateDummyAbsensi(siswaList: Siswa[]): Absensi[] {
  const absensiList: Absensi[] = [];

  siswaList.forEach((siswa) => {
    const totalHari = 180;
    const hadir = randomInt(140, 180);
    const sakit = randomInt(0, 15);
    const izin = randomInt(0, 10);
    const alpha = totalHari - hadir - sakit - izin;
    const persentaseKehadiran = parseFloat(((hadir / totalHari) * 100).toFixed(2));

    absensiList.push({
      id: generateId(),
      siswaId: siswa.id,
      nis: siswa.nis,
      nama: siswa.namaLengkap,
      kelas: siswa.kelas,
      hadir,
      sakit,
      izin,
      alpha: Math.max(0, alpha),
      totalHari,
      persentaseKehadiran,
      semester: randomChoice(['Ganjil', 'Genap'] as const),
      tahunAjaran: `${siswa.tahunMasuk}/${siswa.tahunMasuk + 1}`,
    });
  });

  return absensiList;
}

export function generateDummyNilai(siswaList: Siswa[]): Nilai[] {
  const nilaiList: Nilai[] = [];

  siswaList.forEach((siswa) => {
    const jumlahMapel = randomInt(5, 8);
    const selectedMapel = mataPelajaranList.slice(0, jumlahMapel);

    selectedMapel.forEach((mapel) => {
      nilaiList.push({
        id: generateId(),
        siswaId: siswa.id,
        nis: siswa.nis,
        nama: siswa.namaLengkap,
        kelas: siswa.kelas,
        mataPelajaran: mapel,
        uh1: randomInt(60, 100),
        uh2: randomInt(60, 100),
        uh3: Math.random() > 0.3 ? randomInt(60, 100) : null,
        kt1: randomInt(60, 100),
        kt2: randomInt(60, 100),
        kt3: Math.random() > 0.3 ? randomInt(60, 100) : null,
        stsGanjil: randomInt(60, 100),
        stsGenap: randomInt(60, 100),
        sasGanjil: randomInt(60, 100),
        sasGenap: randomInt(60, 100),
        semester: randomChoice(['Ganjil', 'Genap'] as const),
        tahunAjaran: `${siswa.tahunMasuk}/${siswa.tahunMasuk + 1}`,
      });
    });
  });

  return nilaiList;
}

export function generateDummyTabungan(siswaList: Siswa[]): Tabungan[] {
  const tabunganList: Tabungan[] = [];

  siswaList.forEach((siswa) => {
    const transaksi: TransaksiTabungan[] = [];
    const jumlahTransaksi = randomInt(3, 12);
    let totalSetoran = 0;
    let totalPenarikan = 0;

    for (let i = 0; i < jumlahTransaksi; i++) {
      const isSetor = Math.random() > 0.3;
      const jumlah = randomInt(10000, 200000);

      if (isSetor) {
        totalSetoran += jumlah;
        transaksi.push({
          id: generateId(),
          siswaId: siswa.id,
          tanggal: randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30)),
          jenis: 'setor',
          jumlah,
          keterangan: 'Setoran tabungan',
        });
      } else {
        totalPenarikan += jumlah;
        transaksi.push({
          id: generateId(),
          siswaId: siswa.id,
          tanggal: randomDate(new Date(2024, 0, 1), new Date(2025, 5, 30)),
          jenis: 'tarik',
          jumlah,
          keterangan: 'Penarikan tabungan',
        });
      }
    }

    tabunganList.push({
      id: generateId(),
      siswaId: siswa.id,
      nis: siswa.nis,
      nama: siswa.namaLengkap,
      kelas: siswa.kelas,
      totalSetoran,
      totalPenarikan,
      saldoAkhir: totalSetoran - totalPenarikan,
      frekuensiTransaksi: jumlahTransaksi,
      tahun: 2024,
      transaksi: transaksi.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()),
    });
  });

  return tabunganList;
}

export function generateAllDummyData() {
  const siswa = generateDummySiswa(50);
  const absensi = generateDummyAbsensi(siswa);
  const nilai = generateDummyNilai(siswa);
  const tabungan = generateDummyTabungan(siswa);

  return { siswa, absensi, nilai, tabungan };
}
