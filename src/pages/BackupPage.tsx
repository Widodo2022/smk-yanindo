import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Database,
  CheckCircle,
  XCircle,
  FileJson,
  Shield,
  Key,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AppState } from '@/types';
import {
  downloadJSON,
  readJSONFile,
  clearAllData,
  verifyMasterKey,
  getMasterKey,
} from '@/lib/storage';
import { generateAllDummyData } from '@/lib/dummyData';

interface BackupPageProps {
  state: AppState;
  setState: (state: AppState) => void;
}

export function BackupPage({ state, setState }: BackupPageProps) {
  const [importKey, setImportKey] = useState('');
  const [clearKey, setClearKey] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showKeyDialog, setShowKeyDialog] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const stats = [
    { label: 'Total Siswa', value: state.siswa.length, icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Data Absensi', value: state.absensi.length, icon: Database, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Data Nilai', value: state.nilai.length, icon: Database, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Data Tabungan', value: state.tabungan.length, icon: Database, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const handleExport = () => {
    downloadJSON(state);
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
    setImportStatus('idle');
    setImportMessage('');
    setImportKey('');
  };

  const handleImportConfirm = async () => {
    if (!verifyMasterKey(importKey)) {
      setImportStatus('error');
      setImportMessage('Master key tidak valid!');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await readJSONFile(file);
    if (data) {
      setState(data);
      setImportStatus('success');
      setImportMessage(`Berhasil mengimpor data: ${data.siswa.length} siswa, ${data.absensi.length} absensi, ${data.nilai.length} nilai, ${data.tabungan.length} tabungan`);
      setTimeout(() => {
        setShowImportDialog(false);
        setImportStatus('idle');
      }, 2000);
    } else {
      setImportStatus('error');
      setImportMessage('Gagal membaca file JSON. Pastikan format file benar.');
    }
    e.target.value = '';
  };

  const handleClearClick = () => {
    setShowClearDialog(true);
    setClearKey('');
  };

  const handleClearConfirm = () => {
    if (!verifyMasterKey(clearKey)) {
      alert('Master key tidak valid!');
      return;
    }
    clearAllData();
    setState({ siswa: [], absensi: [], nilai: [], tabungan: [] });
    setShowClearDialog(false);
    alert('Semua data berhasil dihapus!');
  };

  const handleShowKey = () => {
    setShowKeyDialog(true);
  };

  const handleGenerateDemo = () => {
    const dummyData = generateAllDummyData();
    setState(dummyData);
    setShowDemoDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Backup Data</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola backup, export, import, dan hapus data</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Export Card */}
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Export semua data (siswa, absensi, nilai, tabungan) ke file JSON untuk backup.
            </p>
            <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card className="border-2 border-green-100 hover:border-green-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Import data dari file JSON. Data yang ada akan ditimpa oleh data baru.
            </p>
            <Button onClick={handleImportClick} className="w-full bg-green-600 hover:bg-green-700">
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Clear Card */}
        <Card className="border-2 border-red-100 hover:border-red-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-lg text-red-600">Hapus Semua Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Hapus seluruh data dari database. Tindakan ini tidak dapat dibatalkan!
            </p>
            <Button onClick={handleClearClick} variant="destructive" className="w-full">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* Generate Demo Card */}
        <Card className="border-2 border-purple-100 hover:border-purple-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg text-purple-600">Data Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Isi database dengan 50 data siswa demo untuk mencoba fitur aplikasi.
            </p>
            <Button
              onClick={() => setShowDemoDialog(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Data Demo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Master Key Info */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Keamanan Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Untuk melakukan import dan penghapusan data, Anda memerlukan Master Key.
                Master key digunakan untuk melindungi data dari akses tidak sah.
              </p>
              <Button
                variant="outline"
                onClick={handleShowKey}
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Lihat Master Key
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Format Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Format File JSON
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            File JSON harus memiliki struktur berikut:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs overflow-x-auto">
{`{
  "siswa": [
    {
      "id": "string",
      "nis": "string",
      "namaLengkap": "string",
      "jenisKelamin": "Laki-laki" | "Perempuan",
      "kelas": "string",
      "tahunMasuk": number,
      "status": "Aktif" | "Alumni" | "Nonaktif",
      "alamat": "string",
      "noTelepon": "string",
      "tempatLahir": "string",
      "tanggalLahir": "YYYY-MM-DD"
    }
  ],
  "absensi": [...],
  "nilai": [...],
  "tabungan": [...]
}`}
          </pre>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Data dari JSON</DialogTitle>
            <DialogDescription>
              Masukkan Master Key untuk melanjutkan import data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Master Key
              </label>
              <Input
                type="password"
                value={importKey}
                onChange={(e) => { setImportKey(e.target.value); setImportStatus('idle'); }}
                placeholder="Masukkan master key..."
              />
            </div>

            {importStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">{importMessage}</p>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <XCircle className="w-5 h-5" />
                <p className="text-sm">{importMessage}</p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                Batal
              </Button>
              <Button
                onClick={handleImportConfirm}
                className="bg-green-600 hover:bg-green-700"
                disabled={!importKey}
              >
                <Upload className="w-4 h-4 mr-2" />
                Pilih File & Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Hapus Semua Data
            </DialogTitle>
            <DialogDescription>
              Tindakan ini akan menghapus SELURUH data dari database. Data yang dihapus tidak dapat dikembalikan!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Peringatan:</strong> Anda akan menghapus:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• {state.siswa.length} data siswa</li>
                <li>• {state.absensi.length} data absensi</li>
                <li>• {state.nilai.length} data nilai</li>
                <li>• {state.tabungan.length} data tabungan</li>
              </ul>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Masukkan Master Key untuk konfirmasi
              </label>
              <Input
                type="password"
                value={clearKey}
                onChange={(e) => setClearKey(e.target.value)}
                placeholder="Master key..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearConfirm}
                disabled={!clearKey}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Ya, Hapus Semua Data
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Show Key Dialog */}
      <Dialog open={showKeyDialog} onOpenChange={setShowKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Master Key
            </DialogTitle>
            <DialogDescription>
              Gunakan master key ini untuk operasi import dan penghapusan data.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm break-all">
              {getMasterKey()}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <Shield className="w-3 h-3 inline mr-1" />
              Jaga kerahasiaan master key ini. Jangan bagikan kepada pihak tidak berwenang.
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowKeyDialog(false)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Demo Dialog */}
      <Dialog open={showDemoDialog} onOpenChange={setShowDemoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-purple-600 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Data Demo
            </DialogTitle>
            <DialogDescription>
              Aksi ini akan mengisi database dengan 50 data siswa, data absensi, nilai, dan tabungan dummy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                <strong>Data yang akan dibuat:</strong>
              </p>
              <ul className="text-sm text-purple-700 mt-2 space-y-1">
                <li>• 50 data siswa</li>
                <li>• 50 data absensi</li>
                <li>• ~350 data nilai</li>
                <li>• 50 data tabungan</li>
              </ul>
            </div>

            {state.siswa.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  <strong>Perhatian:</strong> Database Anda saat ini sudah memiliki data. Generate data demo akan menambah data baru tanpa menghapus data lama.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDemoDialog(false)}>
                Batal
              </Button>
              <Button
                onClick={handleGenerateDemo}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ya, Generate Demo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
