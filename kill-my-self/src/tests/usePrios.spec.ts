import { describe, it, expect, beforeEach, vi } from 'vitest';

// Tests für das Prio-Composable: Defaults, Persistenz via CSV.
const PRIOS_KEY = 'priorities_csv';

describe('usePrios', () => {
  beforeEach(() => {
    // Sauberes Storage und neuer Modul-Ladevorgang je Test.
    localStorage.clear();
    vi.resetModules();
  });

  it('initialisiert Standard-Priorit��ten, wenn kein CSV im localStorage liegt', async () => {
    // Arrange: Sicherstellen, dass kein CSV existiert.
    localStorage.removeItem(PRIOS_KEY);

    const { usePrios } = await import('../composable/usePrios');
    const { prios } = usePrios();

    // Assert: Default-Prios wurden gesetzt.
    expect(prios.value).toEqual([
      { key: 'high',   label: 'Hoch',    weight: 1 },
      { key: 'medium', label: 'Mittel',  weight: 2 },
      { key: 'low',    label: 'Niedrig', weight: 3 },
    ]);
  });

  it('fǬgt eine Prio hinzu und speichert sie per CSV in localStorage', async () => {
    // Arrange: Reset ohne CSV, dann Composable laden.
    localStorage.removeItem(PRIOS_KEY);

    const { usePrios } = await import('../composable/usePrios');
    const { prios, addPrio } = usePrios();

    const newPrio = { key: 'urgent', label: 'Dringend', weight: 0 };

    // Act: Neue Prio hinzufügen.
    addPrio(newPrio);

    // Assert: In Memory vorhanden...
    expect(prios.value).toContainEqual(newPrio);

    // ...und als CSV persistiert.
    const csv = localStorage.getItem(PRIOS_KEY);
    expect(csv).toBeTruthy();

    const lines = (csv as string).split('\n');
    expect(lines[0]).toBe('key,label,weight'); // Header
    // 3 default + 1 neue = 4 Zeilen + Header
    expect(lines.length).toBe(1 + 4);

    // letzte Zeile: unsere neue Prio
    expect(lines[lines.length - 1]).toBe('urgent,Dringend,0');
  });

  it('deletePrio entfernt Eintrag und aktualisiert CSV', async () => {
    localStorage.removeItem(PRIOS_KEY);

    const { usePrios } = await import('../composable/usePrios');
    const { prios, deletePrio } = usePrios();

    // Standardprios vorhanden, high löschen.
    deletePrio('high');

    expect(prios.value.find(p => p.key === 'high')).toBeUndefined();

    const csv = localStorage.getItem(PRIOS_KEY);
    expect(csv).toBeTruthy();
    const lines = (csv as string).split('\n').slice(1); // ohne Header
    expect(lines.some(line => line.startsWith('high,'))).toBe(false);
  });
});
