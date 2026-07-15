import type { AppState, Siswa, Absensi, Nilai, Tabungan } from '@/types';

const STORAGE_KEY = 'smk_yanindo_data';
const MASTER_KEY = '$2a$10$XvGABDdkFFTSucENNGvLJeki8JBqbYl.7/6MbOkWHH0aAmbXbRsuC';

export function getMasterKey(): string {
  return MASTER_KEY;
}

export function verifyMasterKey(key: string): boolean {
  return key === MASTER_KEY;
}

export function getInitialState(): AppState {
  return {
    siswa: [],
    absensi: [],
    nilai: [],
    tabungan: [],
  };
}

export function loadData(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  return getInitialState();
}

export function saveData(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

export function exportToJSON(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importFromJSON(jsonString: string): AppState | null {
  try {
    const data = JSON.parse(jsonString);
    if (data.siswa && data.absensi && data.nilai && data.tabungan) {
      return data as AppState;
    }
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
  return null;
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadJSON(state: AppState, filename: string = 'smk_yanindo_backup'): void {
  const jsonStr = exportToJSON(state);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readJSONFile(file: File): Promise<AppState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = importFromJSON(content);
        resolve(data);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

// Helper functions for CRUD operations
export function addSiswa(state: AppState, siswa: Siswa): AppState {
  const newState = { ...state, siswa: [...state.siswa, siswa] };
  saveData(newState);
  return newState;
}

export function updateSiswa(state: AppState, siswa: Siswa): AppState {
  const newState = {
    ...state,
    siswa: state.siswa.map((s) => (s.id === siswa.id ? siswa : s)),
  };
  saveData(newState);
  return newState;
}

export function deleteSiswa(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    siswa: state.siswa.filter((s) => s.id !== id),
    absensi: state.absensi.filter((a) => a.siswaId !== id),
    nilai: state.nilai.filter((n) => n.siswaId !== id),
    tabungan: state.tabungan.filter((t) => t.siswaId !== id),
  };
  saveData(newState);
  return newState;
}

export function addAbsensi(state: AppState, absensi: Absensi): AppState {
  const newState = { ...state, absensi: [...state.absensi, absensi] };
  saveData(newState);
  return newState;
}

export function updateAbsensi(state: AppState, absensi: Absensi): AppState {
  const newState = {
    ...state,
    absensi: state.absensi.map((a) => (a.id === absensi.id ? absensi : a)),
  };
  saveData(newState);
  return newState;
}

export function deleteAbsensi(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    absensi: state.absensi.filter((a) => a.id !== id),
  };
  saveData(newState);
  return newState;
}

export function addNilai(state: AppState, nilai: Nilai): AppState {
  const newState = { ...state, nilai: [...state.nilai, nilai] };
  saveData(newState);
  return newState;
}

export function updateNilai(state: AppState, nilai: Nilai): AppState {
  const newState = {
    ...state,
    nilai: state.nilai.map((n) => (n.id === nilai.id ? nilai : n)),
  };
  saveData(newState);
  return newState;
}

export function deleteNilai(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    nilai: state.nilai.filter((n) => n.id !== id),
  };
  saveData(newState);
  return newState;
}

export function addTabungan(state: AppState, tabungan: Tabungan): AppState {
  const newState = { ...state, tabungan: [...state.tabungan, tabungan] };
  saveData(newState);
  return newState;
}

export function updateTabungan(state: AppState, tabungan: Tabungan): AppState {
  const newState = {
    ...state,
    tabungan: state.tabungan.map((t) => (t.id === tabungan.id ? tabungan : t)),
  };
  saveData(newState);
  return newState;
}

export function deleteTabungan(state: AppState, id: string): AppState {
  const newState = {
    ...state,
    tabungan: state.tabungan.filter((t) => t.id !== id),
  };
  saveData(newState);
  return newState;
}
