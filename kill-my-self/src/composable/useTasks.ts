import { computed, reactive } from "vue";
import { ensureDefaultPriorities, usePriorities } from "./usePriorities";

export type ID = string;

export interface Task {
    title: string;
    description?: string;
    /** ALT (Legacy): numeric priority – wird migriert */
    priority?: 1 | 2 | 3;
    /** NEU: referenziert eigene Prioritäten */
    priorityId?: ID | null;
    done: boolean;
    categoryId?: ID | null;
    updatedAt: string;
}

type TaskDict = Record<ID, Task>;
const STORAGE_KEY = "tasks_dict_v1";

function uid(): ID {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load(): TaskDict {
    // Stelle sicher, dass es Default-Prioritäten gibt (IDs nötig für Migration)
    const defaults = ensureDefaultPriorities();

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const obj = (raw ? JSON.parse(raw) : {}) as Partial<TaskDict>;

        for (const id of Object.keys(obj) as ID[]) {
            const t = obj[id];
            if (!t) continue;

            if (typeof t.done !== "boolean") t.done = false;
            if (!t.updatedAt) t.updatedAt = new Date().toISOString();
            if (!("categoryId" in t)) t.categoryId = null;

            // MIGRATION: numeric priority → priorityId
            if (!t.priorityId) {
                if (t.priority === 1) t.priorityId = defaults.high;
                else if (t.priority === 3) t.priorityId = defaults.low;
                else t.priorityId = defaults.medium;
            }
            // Aufräumen optional: alte Zahl behalten wir vorerst für Abwärtskompatibilität
        }
        return obj as TaskDict;
    } catch {
        console.warn("Konnte tasks nicht laden – setze leer.");
        return {};
    }
}

function save(dict: TaskDict) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
}

const state = reactive<{ tasks: TaskDict; editingId: ID | null }>({
    tasks: load(),
    editingId: null,
});

export function useTasks() {
    const { getById } = usePriorities();

    // Sortierung: offen vor erledigt, dann nach Priorität.order (kleiner = wichtiger), danach updatedAt
    const entries = computed<[ID, Task][]>(() => {
        const pairs = Object.entries(state.tasks) as [ID, Task][];
        return pairs.sort(([, a], [, b]) => {
            if (a.done !== b.done) return a.done ? 1 : -1;

            const pa = getById(a.priorityId)?.order ?? 9999;
            const pb = getById(b.priorityId)?.order ?? 9999;
            if (pa !== pb) return pa - pb;

            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    });

    function addTask(input: { title: string; description?: string; priorityId?: ID | null }) {
        const id = uid();
        state.tasks[id] = {
            title: input.title.trim(),
            description: input.description?.trim(),
            priorityId: input.priorityId ?? null,
            done: false,
            updatedAt: new Date().toISOString(),
        };
        save(state.tasks);
        return id;
    }

    function updateTask(id: ID, patch: Partial<Omit<Task, "updatedAt">>) {
        const cur = state.tasks[id];
        if (!cur) return;
        state.tasks[id] = {
            ...cur,
            ...patch,
            title: (patch.title ?? cur.title)?.trim(),
            description: (patch.description ?? cur.description)?.trim(),
            updatedAt: new Date().toISOString(),
        };
        save(state.tasks);
    }

    function setEditing(id: ID | null) { state.editingId = id; }
    function get(id: ID) { return state.tasks[id] ?? null; }

    return { tasksDict: state.tasks, entries, editingId: computed(()=>state.editingId), addTask, updateTask, get, setEditing };
}
