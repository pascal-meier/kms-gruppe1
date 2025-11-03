import { computed, reactive } from "vue";

export type ID = string;

export interface Task {
    title: string;
    description?: string;
    priority: 1 | 2 | 3;   // 1=hoch, 2=mittel, 3=niedrig
    done: boolean;
    categoryId?: ID | null;
    updatedAt: string;     // ISO
}

type TaskDict = Record<ID, Task>;
const STORAGE_KEY = "tasks_dict_v1";

function uid(): ID {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function load(): TaskDict {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const obj = (raw ? JSON.parse(raw) : {}) as Partial<TaskDict>;
        for (const id of Object.keys(obj) as ID[]) {
            const t = obj[id];
            if (!t) continue;
            if (typeof t.done !== "boolean") t.done = false;
            if (t.priority !== 1 && t.priority !== 2 && t.priority !== 3) t.priority = 2;
            if (!t.updatedAt) t.updatedAt = new Date().toISOString();
            if (!("categoryId" in t)) t.categoryId = null;
            if (typeof t.title !== "string") t.title = String(t.title ?? "").trim();
            if (t.description != null) t.description = String(t.description).trim();
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

const state = reactive<{
    tasks: TaskDict;
    editingId: ID | null;
}>({
    tasks: load(),
    editingId: null,
});

export function useTasks() {
    const entries = computed<[ID, Task][]>(() => {
        const pairs = Object.entries(state.tasks) as [ID, Task][];
        return pairs.sort(([, a], [, b]) => {
            if (a.done !== b.done) return a.done ? 1 : -1;                // offen vor erledigt
            if (a.priority !== b.priority) return a.priority - b.priority; // 1 vor 2 vor 3
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    });

    function addTask(input: { title: string; description?: string; priority?: 1|2|3; categoryId?: ID | null }) {
        const id = uid();
        state.tasks[id] = {
            title: input.title.trim(),
            description: input.description?.trim(),
            priority: input.priority ?? 2,
            categoryId: input.categoryId ?? null,
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

    return {
        tasksDict: state.tasks,
        entries,
        editingId: computed(() => state.editingId),
        addTask,
        updateTask,
        get,
        setEditing,
    };
}
