import { useState, useMemo } from 'react';
import { Search, Wallet, Plus, Pencil, Trash2, X, ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { AppState, Tabungan, TransaksiTabungan } from '@/types';
import { addTabungan, updateTabungan, deleteTabungan } from '@/lib/storage';

interface TabunganPageProps {
  state: AppState;
  setState: (state: AppState | ((prev: AppState) => AppState)) => void;
}

const ITEMS_PER_PAGE = 10;

export function TabunganPage({ state, setState }: TabunganPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransaksiDialogOpen, setIsTransaksiDialogOpen] = useState(false);
  const [editingTabungan, setEditingTabungan] = useState<Tabungan | null>(null);
  const [viewTransaksi, setViewTransaksi] = useState<Tabungan | null>(null);
  const [isAddTransaksiOpen, setIsAddTransaksiOpen] = useState(false);

  // Get unique kelas
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(state.tabungan.map((t) => t.kelas));
    return Array.from(kelasSet).sort();
  }, [state.tabungan]);

  // Filter logic
  const filteredTabungan = useMemo(() => {
    return state.tabungan.filter((t) => {
      const matchesSearch =
        searchQuery === '' ||
        t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKelas = filterKelas === 'all' || t.kelas === filterKelas;

      return matchesSearch && matchesKelas;
    });
  }, [state.tabungan, searchQuery, filterKelas]);

  // Pagination
  const totalPages = Math.ceil(filteredTabungan.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTabungan.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTabungan, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredTabungan.length;
    const totalSetoran = filteredTabungan.reduce((sum, t) => sum + t.totalSetoran, 0);
    const totalPenarikan = filteredTabungan.reduce((sum, t) => sum + t.totalPenarikan, 0);
    const totalSaldo = filteredTabungan.reduce((sum, t) => sum + t.saldoAkhir, 0);
    const totalTransaksi = filteredTabungan.reduce((sum, t) => sum + t.frekuensiTransaksi, 0);
    return { total, totalSetoran, totalPenarikan, totalSaldo, totalTransaksi };
  }, [filteredTabungan]);

  // CRUD handlers
  const handleAdd = (tabungan: Omit<Tabungan, 'id' | 'transaksi' | 'totalSetoran' | 'totalPenarikan' | 'saldoAkhir' | 'frekuensiTransaksi'>) => {
    const newTabungan: Tabungan = {
      ...tabungan,
      id: `tab_${Date.now()}`,
      totalSetoran: 0,
      totalPenarikan: 0,
      saldoAkhir: 0,
      frekuensiTransaksi: 0,
      transaksi: [],
    };
    setState((prev) => addTabungan(prev, newTabungan));
    setIsDialogOpen(false);
  };

  const handleUpdate = (tabungan: Tabungan) => {
    setState((prev) => updateTabungan(prev, tabungan));
    setEditingTabungan(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data tabungan ini?')) {
      setState((prev) => deleteTabungan(prev, id));
    }
  };

  const handleAddTransaksi = (tabunganId: string, transaksi: Omit<TransaksiTabungan, 'id'>) => {
    setState((prev) => {
      const updated = prev.tabungan.map((t) => {
        if (t.id === tabunganId) {
          const newTransaksi: TransaksiTabungan = {
            ...transaksi,
            id: `tr_${Date.now()}`,
          };
          const newTransaksiList = [...t.transaksi, newTransaksi].sort(
            (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
          );
          const totalSetoran = newTransaksiList
            .filter((tr) => tr.jenis === 'setor')
            .reduce((sum, tr) => sum + tr.jumlah, 0);
          const totalPenarikan = newTransaksiList
            .filter((tr) => tr.jenis === 'tarik')
            .reduce((sum, tr) => sum + tr.jumlah, 0);

          return {
            ...t,
            transaksi: newTransaksiList,
            totalSetoran,
            totalPenarikan,
            saldoAkhir: totalSetoran - totalPenarikan,
            frekuensiTransaksi: newTransaksiList.length,
          };
        }
        return t;
      });
      return { ...prev, tabungan: updated };
    });
    setIsAddTransaksiOpen(false);
  };

  const handleDeleteTransaksi = (tabunganId: string, transaksiId: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    setState((prev) => {
      const updated = prev.tabungan.map((t) => {
        if (t.id === tabunganId) {
          const newTransaksiList = t.transaksi.filter((tr) => tr.id !== transaksiId);
          const totalSetoran = newTransaksiList
            .filter((tr) => tr.jenis === 'setor')
            .reduce((sum, tr) => sum + tr.jumlah, 0);
          const totalPenarikan = newTransaksiList
            .filter((tr) => tr.jenis === 'tarik')
            .reduce((sum, tr) => sum + tr.jumlah, 0);

          return {
            ...t,
            transaksi: newTransaksiList,
            totalSetoran,
            totalPenarikan,
            saldoAkhir: totalSetoran - totalPenarikan,
            frekuensiTransaksi: newTransaksiList.length,
          };
        }
        return t;
      });
      return { ...prev, tabungan: updated };
    });
  };

  const openAddDialog = () => {
    setEditingTabungan(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (tabungan: Tabungan) => {
    setEditingTabungan(tabungan);
    setIsDialogOpen(true);
  };

  const openTransaksiDialog = (tabungan: Tabungan) => {
    setViewTransaksi(tabungan);
    setIsTransaksiDialogOpen(true);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tabungan Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola tabungan dan transaksi siswa</p>
        </div>
        <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Tabungan
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Siswa</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Total Setoran</p>
                <p className="text-xl font-bold text-green-600">{formatRupiah(stats.totalSetoran)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Total Penarikan</p>
                <p className="text-xl font-bold text-red-600">{formatRupiah(stats.totalPenarikan)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">Total Saldo</p>
                <p className="text-xl font-bold text-blue-700">{formatRupiah(stats.totalSaldo)}</p>
              </div>
            </div>
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
                placeholder="Cari nama, NIS, kelas..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
            <Select value={filterKelas} onValueChange={(v) => { setFilterKelas(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kelas</SelectItem>
                {kelasOptions.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-12">No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">NIS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">Kelas</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Setoran</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Penarikan</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Saldo Akhir</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Frek. Trans</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Tahun</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      Tidak ada data tabungan yang sesuai
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((t, index) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium">{t.nis}</td>
                      <td className="py-3 px-4">{t.nama}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{t.kelas}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {formatRupiah(t.totalSetoran)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        {formatRupiah(t.totalPenarikan)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge className={t.saldoAkhir >= 0 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                          {formatRupiah(t.saldoAkhir)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {t.frekuensiTransaksi}x
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell">{t.tahun}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openTransaksiDialog(t)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Lihat Transaksi"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditDialog(t)}
                            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            title="Hapus"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Halaman {currentPage} dari {totalPages} ({filteredTabungan.length} data)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTabungan ? 'Edit Tabungan' : 'Tambah Tabungan Baru'}</DialogTitle>
          </DialogHeader>
          <TabunganForm
            tabungan={editingTabungan}
            siswaList={state.siswa}
            onSubmit={editingTabungan ? handleUpdate : handleAdd}
            onCancel={() => { setEditingTabungan(null); setIsDialogOpen(false); }}
          />
        </DialogContent>
      </Dialog>

      {/* Transaksi Dialog */}
      <Dialog open={isTransaksiDialogOpen} onOpenChange={setIsTransaksiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Riwayat Transaksi - {viewTransaksi?.nama}
            </DialogTitle>
          </DialogHeader>
          {viewTransaksi && (
            <div className="space-y-4 mt-4">
              {/* Info Card */}
              <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Setoran</p>
                  <p className="text-lg font-bold text-green-600">{formatRupiah(viewTransaksi.totalSetoran)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Penarikan</p>
                  <p className="text-lg font-bold text-red-600">{formatRupiah(viewTransaksi.totalPenarikan)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Saldo Akhir</p>
                  <p className="text-lg font-bold text-blue-600">{formatRupiah(viewTransaksi.saldoAkhir)}</p>
                </div>
              </div>

              {/* Add Transaksi Button */}
              <Button
                onClick={() => setIsAddTransaksiOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>

              {/* Transaksi List */}
              {isAddTransaksiOpen && (
                <TransaksiForm
                  onSubmit={(transaksi) => handleAddTransaksi(viewTransaksi.id, transaksi)}
                  onCancel={() => setIsAddTransaksiOpen(false)}
                />
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-2 px-3 font-medium">Tanggal</th>
                      <th className="text-left py-2 px-3 font-medium">Jenis</th>
                      <th className="text-right py-2 px-3 font-medium">Jumlah</th>
                      <th className="text-left py-2 px-3 font-medium">Keterangan</th>
                      <th className="text-center py-2 px-3 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {viewTransaksi.transaksi.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Belum ada transaksi
                        </td>
                      </tr>
                    ) : (
                      viewTransaksi.transaksi.map((tr) => (
                        <tr key={tr.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3">{new Date(tr.tanggal).toLocaleDateString('id-ID')}</td>
                          <td className="py-2 px-3">
                            <Badge className={tr.jenis === 'setor' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {tr.jenis === 'setor' ? 'Setor' : 'Tarik'}
                            </Badge>
                          </td>
                          <td className={`py-2 px-3 text-right font-medium ${tr.jenis === 'setor' ? 'text-green-600' : 'text-red-600'}`}>
                            {formatRupiah(tr.jumlah)}
                          </td>
                          <td className="py-2 px-3 text-gray-600">{tr.keterangan}</td>
                          <td className="py-2 px-3 text-center">
                            <button
                              onClick={() => handleDeleteTransaksi(viewTransaksi.id, tr.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabunganForm({
  tabungan,
  siswaList,
  onSubmit,
  onCancel,
}: {
  tabungan: Tabungan | null;
  siswaList: { id: string; nis: string; namaLengkap: string; kelas: string }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [selectedSiswa, setSelectedSiswa] = useState(tabungan?.siswaId || '');
  const [tahun, setTahun] = useState(tabungan?.tahun || new Date().getFullYear());

  const selectedSiswaData = siswaList.find((s) => s.id === selectedSiswa);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaData) return;

    if (tabungan) {
      onSubmit({
        ...tabungan,
        siswaId: selectedSiswa,
        nis: selectedSiswaData.nis,
        nama: selectedSiswaData.namaLengkap,
        kelas: selectedSiswaData.kelas,
        tahun,
      });
    } else {
      onSubmit({
        siswaId: selectedSiswa,
        nis: selectedSiswaData.nis,
        nama: selectedSiswaData.namaLengkap,
        kelas: selectedSiswaData.kelas,
        tahun,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Siswa</label>
        <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih siswa" />
          </SelectTrigger>
          <SelectContent>
            {siswaList.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.nis} - {s.namaLengkap} ({s.kelas})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Tahun</label>
        <Input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(parseInt(e.target.value))}
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {tabungan ? 'Simpan Perubahan' : 'Tambah Tabungan'}
        </Button>
      </div>
    </form>
  );
}

function TransaksiForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Omit<TransaksiTabungan, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'setor' as 'setor' | 'tarik',
    jumlah: '',
    keterangan: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      siswaId: '',
      tanggal: formData.tanggal,
      jenis: formData.jenis,
      jumlah: parseInt(formData.jumlah) || 0,
      keterangan: formData.keterangan,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl space-y-3">
      <h4 className="font-medium text-gray-800">Tambah Transaksi Baru</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700">Tanggal</label>
          <Input
            type="date"
            value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700">Jenis</label>
          <Select
            value={formData.jenis}
            onValueChange={(v) => setFormData({ ...formData, jenis: v as 'setor' | 'tarik' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="setor">Setor</SelectItem>
              <SelectItem value="tarik">Tarik</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-700">Jumlah (Rp)</label>
        <Input
          type="number"
          value={formData.jumlah}
          onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
          placeholder="10000"
          required
          min="0"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-700">Keterangan</label>
        <Input
          value={formData.keterangan}
          onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
          placeholder="Keterangan transaksi"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
          Simpan Transaksi
        </Button>
      </div>
    </form>
  );
}
