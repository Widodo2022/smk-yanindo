import { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Minus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { AppState } from '@/types';

interface AbsensiPageProps {
  state: AppState;
  setState: (state: AppState | ((prev: AppState) => AppState)) => void;
}

const ITEMS_PER_PAGE = 15;

export function AbsensiPage({ state }: AbsensiPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique options for filters
  const kelasOptions = useMemo(() => {
    const kelasSet = new Set(state.absensi.map((a) => a.kelas));
    return Array.from(kelasSet).sort();
  }, [state.absensi]);

  const semesterOptions = useMemo(() => {
    const semSet = new Set(state.absensi.map((a) => a.semester));
    return Array.from(semSet).sort();
  }, [state.absensi]);

  // Filter logic with search highlight
  const filteredAbsensi = useMemo(() => {
    return state.absensi.filter((absensi) => {
      const matchesSearch =
        searchQuery === '' ||
        absensi.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        absensi.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        absensi.kelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesKelas = filterKelas === 'all' || absensi.kelas === filterKelas;
      const matchesSemester = filterSemester === 'all' || absensi.semester === filterSemester;

      return matchesSearch && matchesKelas && matchesSemester;
    });
  }, [state.absensi, searchQuery, filterKelas, filterSemester]);

  // Pagination
  const totalPages = Math.ceil(filteredAbsensi.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAbsensi.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAbsensi, currentPage]);

  // Statistics - adaptive to filters
  const stats = useMemo(() => {
    const total = filteredAbsensi.length;
    const totalHadir = filteredAbsensi.reduce((sum, a) => sum + a.hadir, 0);
    const totalSakit = filteredAbsensi.reduce((sum, a) => sum + a.sakit, 0);
    const totalIzin = filteredAbsensi.reduce((sum, a) => sum + a.izin, 0);
    const totalAlpha = filteredAbsensi.reduce((sum, a) => sum + a.alpha, 0);
    const avgKehadiran = total > 0
      ? (filteredAbsensi.reduce((sum, a) => sum + a.persentaseKehadiran, 0) / total).toFixed(2)
      : '0';

    return { total, totalHadir, totalSakit, totalIzin, totalAlpha, avgKehadiran };
  }, [filteredAbsensi]);

  // Highlight search text
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

  // Kehadiran badge
  const getKehadiranBadge = (persentase: number) => {
    if (persentase >= 90) return 'bg-green-100 text-green-700';
    if (persentase >= 75) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Absensi Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">Data kehadiran siswa SMK Yanindo</p>
      </div>

      {/* Statistics Cards - Adaptive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500">Total Hadir</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalHadir.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Minus className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-xs text-gray-500">Total Sakit</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalSakit.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Total Izin</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalIzin.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Total Alpha</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalAlpha.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-gray-500">Siswa Terfilter</p>
                <p className="text-lg font-bold text-gray-900">{stats.total} siswa</p>
              </div>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <p className="text-xs text-gray-500">Rata-rata Kehadiran</p>
                <p className="text-lg font-bold text-blue-600">{stats.avgKehadiran}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <SelectItem value="all">Semua Semester</SelectItem>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700 w-12">No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">NIS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Nama</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 hidden md:table-cell">Kelas</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Hadir</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Sakit</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Izin</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Alpha</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700 hidden lg:table-cell">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-gray-500">
                      Tidak ada data absensi yang sesuai
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((absensi, index) => (
                    <tr key={absensi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-500">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {highlightText(absensi.nis, searchQuery)}
                      </td>
                      <td className="py-3 px-4">
                        {highlightText(absensi.nama, searchQuery)}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {highlightText(absensi.kelas, searchQuery)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-green-600">{absensi.hadir}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-yellow-600">{absensi.sakit}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-blue-600">{absensi.izin}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium text-red-600">{absensi.alpha}</span>
                      </td>
                      <td className="py-3 px-4 text-center hidden lg:table-cell text-gray-600">
                        {absensi.totalHari}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getKehadiranBadge(absensi.persentaseKehadiran)}>
                          {absensi.persentaseKehadiran}%
                        </Badge>
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
                Halaman {currentPage} dari {totalPages} ({filteredAbsensi.length} data)
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
    </div>
  );
}
