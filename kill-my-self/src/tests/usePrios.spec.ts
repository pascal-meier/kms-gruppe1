// usePrios.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const PRIOS_KEY = 'priorities_csv';

describe('usePrios', () => {
  beforeEach(() => {
    // jsdom-localStorage säubern
    localStorage.clear();
    // Vitest-Modulcache leeren, damit loadPrios() beim Import neu läuft
    vi.resetModules();
  });

  it('initialisiert Standard-Prioritäten, wenn kein CSV im localStorage liegt', async () => {
    // Sicherstellen, dass nichts im Storage liegt
    localStorage.removeItem(PRIOS_KEY);

    // dynamischer Import nach dem Reset => loadPrios() läuft jetzt
    const { usePrios } = await import('./usePrios');
    const { prios } = usePrios();

    expect(prios.value).toEqual([
      { key: 'high',   label: 'Hoch',    weight: 1 },
      { key: 'medium', label: 'Mittel',  weight: 2 },
      { key: 'low',    label: 'Niedrig', weight: 3 },
    ]);
  });

  it('fügt eine Prio hinzu und speichert sie per CSV in localStorage', async () => {
    // Start wieder ohne CSV -> Standardwerte werden beim Import gesetzt
    localStorage.removeItem(PRIOS_KEY);

    const { usePrios } = await import('./usePrios');
    const { prios, addPrio } = usePrios();

    const newPrio = { key: 'urgent', label: 'Dringend', weight: 0 };

    addPrio(newPrio);

    // 1) In-Memory: neue Prio vorhanden?
    expect(prios.value).toContainEqual(newPrio);

    // 2) Persistenz: wurde korrekt als CSV gespeichert?
    const csv = localStorage.getItem(PRIOS_KEY);
    expect(csv).toBeTruthy();

    const lines = (csv as string).split('\n');
    expect(lines[0]).toBe('key,label,weight'); // Header
    // 3 default + 1 neue = 4 Zeilen + Header
    expect(lines.length).toBe(1 + 4);

    // letzte Zeile: unsere neue Prio
    expect(lines[lines.length - 1]).toBe('urgent,Dringend,0');
  });
});
