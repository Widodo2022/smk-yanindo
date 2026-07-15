import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { AppState, Siswa, StatusSiswa, JenisKelamin } from '@/types';
import { addSiswa, updateSiswa, deleteSiswa } from '@/lib/storage';

interface SiswaPageProps {
  state: AppState;
  setState: (state: AppState | ((prev: AppState) => AppState)) => void;
}

export function SiswaPage({ state, setState }: SiswaPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJenisKelamin, setFilterJenisKelamin] = useState<string>('all');
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get unique kelas for filter
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(state.siswa.map((s) => s.kelas));
    return Array.from(kelasSet).sort();
  }, [state.siswa]);

  // Filter logic
  const filteredSiswa = useMemo(() => {
    return state.siswa.filter((siswa) => {
      const matchesSearch =
        searchQuery === '' ||
        siswa.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.noTelepon.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKelas = filterKelas === 'all' || siswa.kelas === filterKelas;
      const matchesStatus = filterStatus === 'all' || siswa.status === filterStatus;
      const matchesJK = filterJenisKelamin === 'all' || siswa.jenisKelamin === filterJenisKelamin;

      return matchesSearch && matchesKelas && matchesStatus && matchesJK;
    });
  }, [state.siswa, searchQuery, filterKelas, filterStatus, filterJenisKelamin]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredSiswa.length;
    const lakiLaki = filteredSiswa.filter((s) => s.jenisKelamin === 'Laki-laki').length;
    const perempuan = filteredSiswa.filter((s) => s.jenisKelamin === 'Perempuan').length;
    const aktif = filteredSiswa.filter((s) => s.status === 'Aktif').length;
    const alumni = filteredSiswa.filter((s) => s.status === 'Alumni').length;
    const nonaktif = filteredSiswa.filter((s) => s.status === 'Nonaktif').length;
    const tahunMasukSet = new Set(filteredSiswa.map((s) => s.tahunMasuk));
    return { total, lakiLaki, perempuan, aktif, alumni, nonaktif, tahunMasukCount: tahunMasukSet.size };
  }, [filteredSiswa]);

  // CRUD handlers
  const handleAdd = (siswa: Omit<Siswa, 'id'>) => {
    const newSiswa = { ...siswa, id: `siswa_${Date.now()}` };
    setState((prev) => addSiswa(prev, newSiswa));
    setIsDialogOpen(false);
  };

  const handleUpdate = (siswa: Siswa) => {
    setState((prev) => updateSiswa(prev, siswa));
    setEditingSiswa(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      setState((prev) => deleteSiswa(prev, id));
    }
  };

  const openEditDialog = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingSiswa(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data siswa SMK Yanindo</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSiswa ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
            </DialogHeader>
            <SiswaForm
              siswa={editingSiswa}
              onSubmit={editingSiswa ? handleUpdate : handleAdd}
              onCancel={() => { setEditingSiswa(null); setIsDialogOpen(false); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Siswa</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Laki-laki</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.lakiLaki}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Perempuan</p>
            <p className="text-2xl font-bold text-pink-500 mt-1">{stats.perempuan}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Tahun Masuk</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.tahunMasukCount}</p>
            <p className="text-xs text-gray-400 mt-1">Aktif: {stats.aktif} | Alumni: {stats.alumni} | Nonaktif: {stats.nonaktif}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama, NIS, kelas, alamat, telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Alumni">Alumni</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterJenisKelamin} onValueChange={setFilterJenisKelamin}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Jenis Kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua JK</SelectItem>
                  <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                  <SelectItem value="Perempuan">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avatar</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">NIS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama Lengkap</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">JK</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Kelas</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Thn Masuk</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden xl:table-cell">Alamat</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden xl:table-cell">Telepon</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">TTL</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-gray-500">
                      Tidak ada data siswa yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <AvatarInisial nama={siswa.namaLengkap} jenisKelamin={siswa.jenisKelamin} />
                      </td>
                      <td className="py-3 px-4 font-medium">{siswa.nis}</td>
                      <td className="py-3 px-4">{siswa.namaLengkap}</td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Badge variant={siswa.jenisKelamin === 'Laki-laki' ? 'default' : 'secondary'} className={
                          siswa.jenisKelamin === 'Laki-laki' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-pink-100 text-pink-700 hover:bg-pink-100'
                        }>
                          {siswa.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{siswa.kelas}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">{siswa.tahunMasuk}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={siswa.status} />
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell max-w-[200px] truncate">{siswa.alamat}</td>
                      <td className="py-3 px-4 hidden xl:table-cell">{siswa.noTelepon}</td>
                      <td className="py-3 px-4 hidden lg:table-cell whitespace-nowrap">
                        {siswa.tempatLahir}, {new Date(siswa.tanggalLahir).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditDialog(siswa)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(siswa.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 text-sm text-gray-500">
            Menampilkan {filteredSiswa.length} dari {state.siswa.length} siswa
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AvatarInisial({ nama, jenisKelamin }: { nama: string; jenisKelamin: JenisKelamin }) {
  const inisial = nama
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = jenisKelamin === 'Laki-laki' ? 'bg-blue-500' : 'bg-pink-500';

  return (
    <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm`}>
      {inisial}
    </div>
  );
}

function StatusBadge({ status }: { status: StatusSiswa }) {
  const styles = {
    Aktif: 'bg-green-100 text-green-700 hover:bg-green-100',
    Alumni: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    Nonaktif: 'bg-red-100 text-red-700 hover:bg-red-100',
  };

  return (
    <Badge className={styles[status]}>
      {status}
    </Badge>
  );
}

function SiswaForm({
  siswa,
  onSubmit,
  onCancel,
}: {
  siswa: Siswa | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    nis: siswa?.nis || '',
    namaLengkap: siswa?.namaLengkap || '',
    jenisKelamin: siswa?.jenisKelamin || 'Laki-laki',
    kelas: siswa?.kelas || '',
    tahunMasuk: siswa?.tahunMasuk || new Date().getFullYear(),
    status: siswa?.status || 'Aktif',
    alamat: siswa?.alamat || '',
    noTelepon: siswa?.noTelepon || '',
    tempatLahir: siswa?.tempatLahir || '',
    tanggalLahir: siswa?.tanggalLahir || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (siswa) {
      onSubmit({ ...siswa, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">NIS</label>
          <Input
            value={formData.nis}
            onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
          <Input
            value={formData.namaLengkap}
            onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
          <Select
            value={formData.jenisKelamin}
            onValueChange={(v) => setFormData({ ...formData, jenisKelamin: v as JenisKelamin })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Laki-laki">Laki-laki</SelectItem>
              <SelectItem value="Perempuan">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Kelas</label>
          <Input
            value={formData.kelas}
            onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
            placeholder="Contoh: X RPL 1"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tahun Masuk</label>
          <Input
            type="number"
            value={formData.tahunMasuk}
            onChange={(e) => setFormData({ ...formData, tahunMasuk: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as StatusSiswa })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Alumni">Alumni</SelectItem>
              <SelectItem value="Nonaktif">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Alamat</label>
          <Input
            value={formData.alamat}
            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">No. Telepon</label>
          <Input
            value={formData.noTelepon}
            onChange={(e) => setFormData({ ...formData, noTelepon: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tempat Lahir</label>
          <Input
            value={formData.tempatLahir}
            onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
          <Input
            type="date"
            value={formData.tanggalLahir}
            onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {siswa ? 'Simpan Perubahan' : 'Tambah Siswa'}
        </Button>
      </div>
    </form>
  );
}
