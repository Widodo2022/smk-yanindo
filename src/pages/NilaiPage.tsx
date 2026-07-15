import { useState, useMemo } from 'react';
import { Search, BookOpen, X, ChevronLeft, ChevronRight, Plus, Calculator } from 'lucide-react';
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
import type { AppState, Nilai } from '@/types';
import { addNilai, updateNilai, deleteNilai } from '@/lib/storage';

interface NilaiPageProps {
  state: AppState;
  setState: (state: AppState | ((prev: AppState) => AppState)) => void;
}

const ITEMS_PER_PAGE = 10;

export function NilaiPage({ state, setState }: NilaiPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterMapel, setFilterMapel] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNilai, setEditingNilai] = useState<Nilai | null>(null);

  // Get unique options
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(state.nilai.map((n) => n.kelas));
    return Array.from(kelasSet).sort();
  }, [state.nilai]);

  const mapelOptions = useMemo(() => {
    const mapelSet = new Set(state.nilai.map((n) => n.mataPelajaran));
    return Array.from(mapelSet).sort();
  }, [state.nilai]);

  const semesterOptions = useMemo(() => {
    const semSet = new Set(state.nilai.map((n) => n.semester));
    return Array.from(semSet).sort();
  }, [state.nilai]);

  // Filter logic
  const filteredNilai = useMemo(() => {
    return state.nilai.filter((nilai) => {
      const matchesSearch =
        searchQuery === '' ||
        nilai.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nilai.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nilai.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKelas = filterKelas === 'all' || nilai.kelas === filterKelas;
      const matchesMapel = filterMapel === 'all' || nilai.mataPelajaran === filterMapel;
      const matchesSemester = filterSemester === 'all' || nilai.semester === filterSemester;

      return matchesSearch && matchesKelas && matchesMapel && matchesSemester;
    });
  }, [state.nilai, searchQuery, filterKelas, filterMapel, filterSemester]);

  // Pagination
  const totalPages = Math.ceil(filteredNilai.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNilai.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNilai, currentPage]);

  // Statistics - adaptive
  const stats = useMemo(() => {
    const total = filteredNilai.length;
    const avgUH1 = total > 0 ? (filteredNilai.reduce((sum, n) => sum + (n.uh1 || 0), 0) / filteredNilai.filter(n => n.uh1 != null).length).toFixed(1) : '0';
    const avgUH2 = total > 0 ? (filteredNilai.reduce((sum, n) => sum + (n.uh2 || 0), 0) / filteredNilai.filter(n => n.uh2 != null).length).toFixed(1) : '0';
    const avgSTS = total > 0 ? (filteredNilai.reduce((sum, n) => sum + (n.stsGanjil || 0), 0) / filteredNilai.filter(n => n.stsGanjil != null).length).toFixed(1) : '0';
    const avgSAS = total > 0 ? (filteredNilai.reduce((sum, n) => sum + (n.sasGanjil || 0), 0) / filteredNilai.filter(n => n.sasGanjil != null).length).toFixed(1) : '0';

    // Calculate overall average per student for filtered data
    const studentMap = new Map<string, { nama: string; kelas: string; total: number; count: number }>();
    filteredNilai.forEach((n) => {
      const key = `${n.nis}-${n.kelas}`;
      const existing = studentMap.get(key) || { nama: n.nama, kelas: n.kelas, total: 0, count: 0 };
      const validScores = [n.uh1, n.uh2, n.uh3, n.kt1, n.kt2, n.kt3, n.stsGanjil, n.stsGenap, n.sasGanjil, n.sasGenap]
        .filter((s): s is number => s != null);
      const avg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
      existing.total += avg;
      existing.count += 1;
      studentMap.set(key, existing);
    });

    const studentAvgs = Array.from(studentMap.values()).map(s => s.total / s.count);
    const classAverage = studentAvgs.length > 0 ? (studentAvgs.reduce((a, b) => a + b, 0) / studentAvgs.length).toFixed(1) : '0';

    return { total, avgUH1, avgUH2, avgSTS, avgSAS, classAverage, studentCount: studentMap.size };
  }, [filteredNilai]);

  // Highlight search
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Nilai badge color
  const getNilaiColor = (nilai: number | null) => {
    if (nilai == null) return 'text-gray-400';
    if (nilai >= 85) return 'text-green-600 font-semibold';
    if (nilai >= 70) return 'text-blue-600';
    if (nilai >= 60) return 'text-yellow-600';
    return 'text-red-600 font-semibold';
  };

  // CRUD
  const handleAdd = (nilai: Omit<Nilai, 'id'>) => {
    const newNilai = { ...nilai, id: `nilai_${Date.now()}` };
    setState((prev) => addNilai(prev, newNilai));
    setIsDialogOpen(false);
  };

  const handleUpdate = (nilai: Nilai) => {
    setState((prev) => updateNilai(prev, nilai));
    setEditingNilai(null);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus data nilai ini?')) {
      setState((prev) => deleteNilai(prev, id));
    }
  };

  const openAddDialog = () => {
    setEditingNilai(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (nilai: Nilai) => {
    setEditingNilai(nilai);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nilai Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">Data nilai akademik siswa SMK Yanindo</p>
        </div>
        <Button onClick={openAddDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Nilai
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Data</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Rata-rata UH1</p>
            <p className="text-xl font-bold text-blue-600">{stats.avgUH1}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Rata-rata UH2</p>
            <p className="text-xl font-bold text-blue-600">{stats.avgUH2}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Rata-rata STS</p>
            <p className="text-xl font-bold text-purple-600">{stats.avgSTS}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Rata-rata Kelas</p>
                <p className="text-xl font-bold text-green-600">{stats.classAverage}</p>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterMapel} onValueChange={(v) => { setFilterMapel(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Mata Pelajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mapel</SelectItem>
                  {mapelOptions.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterKelas} onValueChange={(v) => { setFilterKelas(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterSemester} onValueChange={(v) => { setFilterSemester(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {semesterOptions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
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
                  <th className="text-left py-3 px-3 font-medium text-gray-700 w-10">No</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700">NIS</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700">Nama</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700 hidden md:table-cell">Kelas</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-700">Mapel</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">UH1</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">UH2</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700 hidden lg:table-cell">UH3</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">KT1</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">KT2</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700 hidden lg:table-cell">KT3</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">STS Gan</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700 hidden xl:table-cell">STS Gen</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700">SAS Gan</th>
                  <th className="text-center py-3 px-2 font-medium text-gray-700 hidden xl:table-cell">SAS Gen</th>
                  <th className="text-center py-3 px-3 font-medium text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center py-8 text-gray-500">
                      Tidak ada data nilai yang sesuai
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((nilai, index) => (
                    <tr key={nilai.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {highlightText(nilai.nis, searchQuery)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {highlightText(nilai.nama, searchQuery)}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {highlightText(nilai.kelas, searchQuery)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className="text-xs">
                          {nilai.mataPelajaran.length > 15 ? nilai.mataPelajaran.substring(0, 15) + '...' : nilai.mataPelajaran}
                        </Badge>
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.uh1)}`}>
                        {nilai.uh1 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.uh2)}`}>
                        {nilai.uh2 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center hidden lg:table-cell ${getNilaiColor(nilai.uh3)}`}>
                        {nilai.uh3 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.kt1)}`}>
                        {nilai.kt1 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.kt2)}`}>
                        {nilai.kt2 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center hidden lg:table-cell ${getNilaiColor(nilai.kt3)}`}>
                        {nilai.kt3 ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.stsGanjil)}`}>
                        {nilai.stsGanjil ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center hidden xl:table-cell ${getNilaiColor(nilai.stsGenap)}`}>
                        {nilai.stsGenap ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center ${getNilaiColor(nilai.sasGanjil)}`}>
                        {nilai.sasGanjil ?? '-'}
                      </td>
                      <td className={`py-3 px-2 text-center hidden xl:table-cell ${getNilaiColor(nilai.sasGenap)}`}>
                        {nilai.sasGenap ?? '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditDialog(nilai)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(nilai.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
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
                Halaman {currentPage} dari {totalPages} ({filteredNilai.length} data)
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNilai ? 'Edit Nilai' : 'Tambah Nilai Baru'}</DialogTitle>
          </DialogHeader>
          <NilaiForm
            nilai={editingNilai}
            siswaList={state.siswa}
            onSubmit={editingNilai ? handleUpdate : handleAdd}
            onCancel={() => { setEditingNilai(null); setIsDialogOpen(false); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NilaiForm({
  nilai,
  siswaList,
  onSubmit,
  onCancel,
}: {
  nilai: Nilai | null;
  siswaList: { id: string; nis: string; namaLengkap: string; kelas: string }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [selectedSiswa, setSelectedSiswa] = useState(nilai?.siswaId || '');
  const [formData, setFormData] = useState({
    mataPelajaran: nilai?.mataPelajaran || '',
    uh1: nilai?.uh1 ?? '',
    uh2: nilai?.uh2 ?? '',
    uh3: nilai?.uh3 ?? '',
    kt1: nilai?.kt1 ?? '',
    kt2: nilai?.kt2 ?? '',
    kt3: nilai?.kt3 ?? '',
    stsGanjil: nilai?.stsGanjil ?? '',
    stsGenap: nilai?.stsGenap ?? '',
    sasGanjil: nilai?.sasGanjil ?? '',
    sasGenap: nilai?.sasGenap ?? '',
    semester: nilai?.semester || 'Ganjil',
    tahunAjaran: nilai?.tahunAjaran || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  });

  const selectedSiswaData = siswaList.find((s) => s.id === selectedSiswa);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiswaData) return;

    const data = {
      ...(nilai || {}),
      siswaId: selectedSiswa,
      nis: selectedSiswaData.nis,
      nama: selectedSiswaData.namaLengkap,
      kelas: selectedSiswaData.kelas,
      ...formData,
      uh1: formData.uh1 === '' ? null : Number(formData.uh1),
      uh2: formData.uh2 === '' ? null : Number(formData.uh2),
      uh3: formData.uh3 === '' ? null : Number(formData.uh3),
      kt1: formData.kt1 === '' ? null : Number(formData.kt1),
      kt2: formData.kt2 === '' ? null : Number(formData.kt2),
      kt3: formData.kt3 === '' ? null : Number(formData.kt3),
      stsGanjil: formData.stsGanjil === '' ? null : Number(formData.stsGanjil),
      stsGenap: formData.stsGenap === '' ? null : Number(formData.stsGenap),
      sasGanjil: formData.sasGanjil === '' ? null : Number(formData.sasGanjil),
      sasGenap: formData.sasGenap === '' ? null : Number(formData.sasGenap),
    };

    onSubmit(data);
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
        <label className="text-sm font-medium text-gray-700">Mata Pelajaran</label>
        <Input
          value={formData.mataPelajaran}
          onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'uh1', label: 'UH 1' },
          { key: 'uh2', label: 'UH 2' },
          { key: 'uh3', label: 'UH 3' },
          { key: 'kt1', label: 'KT 1' },
          { key: 'kt2', label: 'KT 2' },
          { key: 'kt3', label: 'KT 3' },
          { key: 'stsGanjil', label: 'STS Ganjil' },
          { key: 'stsGenap', label: 'STS Genap' },
          { key: 'sasGanjil', label: 'SAS Ganjil' },
          { key: 'sasGenap', label: 'SAS Genap' },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={(formData as any)[field.key]}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
              placeholder="0-100"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Semester</label>
          <Select
            value={formData.semester}
            onValueChange={(v) => setFormData({ ...formData, semester: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ganjil">Ganjil</SelectItem>
              <SelectItem value="Genap">Genap</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tahun Ajaran</label>
          <Input
            value={formData.tahunAjaran}
            onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
            placeholder="2024/2025"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          {nilai ? 'Simpan Perubahan' : 'Tambah Nilai'}
        </Button>
      </div>
    </form>
  );
}
