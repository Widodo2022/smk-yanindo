import { useState, useEffect, useCallback } from 'react';
import type { AppState } from '@/types';
import { loadData, saveData } from '@/lib/storage';

export function useAppState() {
  const [state, setStateState] = useState<AppState>(() => {
    // Hanya muat data yang sudah tersimpan, tidak auto-generate dummy data
    return loadData();
  });

  const setState = useCallback((newState: AppState | ((prev: AppState) => AppState)) => {
    setStateState((prev) => {
      const updated = typeof newState === 'function' ? newState(prev) : newState;
      saveData(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    saveData(state);
  }, [state]);

  return { state, setState };
}
