import { describe, it, expect, beforeEach, vi } from 'vitest';

const STORAGE_KEY = 'tasks_dict_v1';

describe('useTasks', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.resetModules();
    });

    it('fügt Aufgaben hinzu und setzt sinnvolle Defaults', async () => {
        const { useTasks } = await import('../composable/useTasks');
        const { addTask, get } = useTasks();

        const id1 = addTask({ title: ' Erste Aufgabe ' });
        const id2 = addTask({ title: 'Zweite Aufgabe', priority: 1 });

        const task1 = get(id1);
        const task2 = get(id2);

        expect(task1?.title).toBe('Erste Aufgabe');
        expect(task1?.priority).toBe(2);
        expect(task1?.done).toBe(false);

        expect(task2?.title).toBe('Zweite Aufgabe');
        expect(task2?.priority).toBe(1);
        expect(task2?.done).toBe(false);

        expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it('entfernt Aufgaben aus State und Speicher', async () => {
        const { useTasks } = await import('../composable/useTasks');
        const { addTask, entries, removeTask, get } = useTasks();

        const id = addTask({ title: 'Zu löschender Task', priority: 3 });
        expect(entries.value.length).toBe(1);

        removeTask(id);

        expect(entries.value.length).toBe(0);
        expect(get(id)).toBeNull();
        expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({}));
    });
});