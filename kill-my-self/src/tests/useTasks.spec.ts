import { describe, it, expect, beforeEach, vi } from 'vitest';

// Tests rund um das Tasks-Composable: Defaults, Persistenz, Sonderzeichen.
const STORAGE_KEY = 'tasks_dict_v1';

describe('useTasks', () => {
  beforeEach(() => {
    // Frischer Zustand je Test (Storage + Modul-Cache).
    localStorage.clear();
    vi.resetModules();
  });

  it('fǬgt Aufgaben hinzu und setzt sinnvolle Defaults', async () => {
    // Arrange: Composable holen und zwei Tasks anlegen (mit und ohne Prio).
    const { useTasks } = await import('../composable/useTasks');
    const { addTask, get } = useTasks();

    const id1 = addTask({ title: ' Erste Aufgabe ' });
    const id2 = addTask({ title: 'Zweite Aufgabe', priority: 1 });

    const task1 = get(id1);
    const task2 = get(id2);

    // Assert: Titel getrimmt, Defaults (Prio=2, done=false) gesetzt.
    expect(task1?.title).toBe('Erste Aufgabe');
    expect(task1?.priority).toBe(2);
    expect(task1?.done).toBe(false);

    expect(task2?.title).toBe('Zweite Aufgabe');
    expect(task2?.priority).toBe(1);
    expect(task2?.done).toBe(false);

    // Storage wurde befüllt.
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it('entfernt Aufgaben aus State und Speicher', async () => {
    // Arrange: Einen Task anlegen.
    const { useTasks } = await import('../composable/useTasks');
    const { addTask, entries, removeTask, get } = useTasks();

    const id = addTask({ title: 'Zu l��schender Task', priority: 3 });
    expect(entries.value.length).toBe(1);

    // Act: Task löschen.
    removeTask(id);

    // Assert: Weder im State noch im localStorage vorhanden.
    expect(entries.value.length).toBe(0);
    expect(get(id)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({}));
  });

  it('akzeptiert Sonderzeichen im Titel-Feld', async () => {
    // Arrange: Task mit Sonderzeichen-Titel anlegen.
    const { useTasks } = await import('../composable/useTasks');
    const { addTask, get } = useTasks();

    const title = "��!$";
    const id = addTask({ title });

    // Assert: Titel bleibt erhalten.
    const stored = get(id);
    expect(stored?.title).toBe(title);
  });

  it('clearAllTasks leert State und entfernt Storage-Key', async () => {
    const { useTasks } = await import('../composable/useTasks');
    const { addTask, entries, clearAllTasks } = useTasks();

    addTask({ title: 'One' });
    addTask({ title: 'Two' });
    expect(entries.value.length).toBe(2);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();

    clearAllTasks();

    expect(entries.value.length).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
