// src/composables/usePriorities.ts
import { computed, reactive } from "vue";
export type ID = string;

export interface Priority {
    id: ID;
    name: string;
    color?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

type PriorityDict = Record<ID, Priority>;
const STORAGE_KEY = "priorities_dict_v1";

function uid(): ID {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function save(dict: PriorityDict) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dict));
}

function load(): PriorityDict {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return (raw ? JSON.parse(raw) : {}) as PriorityDict;
    } catch {
        return {};
    }
}

function last<T>(arr: T[]): T | undefined {
    return arr.length ? arr[arr.length - 1] : undefined;
}

/** Erstellt Standard-Prioritäten, wenn keine existieren. Liefert ihre IDs zurück. */
export function ensureDefaultPriorities(): { high: ID; medium: ID; low: ID } {
    const dict = load();
    const now = new Date().toISOString();
    const needDefaults = Object.keys(dict).length === 0;

    let high = "", medium = "", low = "";

    if (needDefaults) {
        high = uid(); medium = uid(); low = uid();
        dict[high]   = { id: high,   name: "Hoch",   color: "#fee2e2", order: 1, createdAt: now, updatedAt: now };
        dict[medium] = { id: medium, name: "Mittel", color: "#e5e7eb", order: 2, createdAt: now, updatedAt: now };
        dict[low]    = { id: low,    name: "Niedrig",color: "#e0f2fe", order: 3, createdAt: now, updatedAt: now };
        save(dict);
    } else {
        const arr = Object.values(dict).sort((a, b) => a.order - b.order);
        high = arr[0]?.id ?? uid();
        medium = arr[1]?.id ?? uid();
        low = arr[2]?.id ?? uid();
    }
    return { high, medium, low };
}

const state = reactive<{ dict: PriorityDict }>({ dict: load() });

export function usePriorities() {
    const list = computed(() =>
        Object.values(state.dict).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    );

    function addPriority(input: { name: string; color?: string; order?: number }) {
        const id = uid();
        const now = new Date().toISOString();
        const lastItem = last(list.value);
        state.dict[id] = {
            id,
            name: input.name.trim(),
            color: input.color || "#e5e7eb",
            order: input.order ?? ((lastItem?.order ?? 2) + 1),
            createdAt: now,
            updatedAt: now,
        };
        save(state.dict);
        return id;
    }

    function updatePriority(id: ID, patch: Partial<Pick<Priority, "name" | "color" | "order">>) {
        const cur = state.dict[id];
        if (!cur) return;
        state.dict[id] = {
            ...cur,
            ...patch,
            name: (patch.name ?? cur.name).trim(),
            updatedAt: new Date().toISOString(),
        };
        save(state.dict);
    }

    function removePriority(id: ID) {
        delete state.dict[id];
        save(state.dict);
    }

    function getById(id: ID | null | undefined) {
        if (!id) return null;
        return state.dict[id] ?? null;
    }

    return { dict: state.dict, list, addPriority, updatePriority, removePriority, getById };
}
