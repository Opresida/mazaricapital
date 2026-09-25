'use client';
// Interruptor DEMO ⇄ REAL: mesma tela, duas fontes de dados.
// DEMO = mock ilustrativo (espelho fiel do formato real, selo tracejado).
// REAL = API NestJS (exige login; módulos sem API mostram estado vazio honesto).
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type DataMode = 'demo' | 'real';
const KEY = 'mzc.dataMode';

const Ctx = createContext<{ mode: DataMode; setMode: (m: DataMode) => void }>({
  mode: 'demo',
  setMode: () => {},
});

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DataMode>('demo');
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'real' || saved === 'demo') setModeState(saved);
    } catch {}
  }, []);
  const setMode = (m: DataMode) => {
    setModeState(m);
    try {
      localStorage.setItem(KEY, m);
    } catch {}
  };
  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export const useDataMode = () => useContext(Ctx);
