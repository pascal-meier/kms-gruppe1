import { vi } from 'vitest';

// Simple in-memory localStorage mock to ensure clear() etc. exist in all environments.
const store = new Map<string, string>();

const localStorageMock: Storage = {
  getItem(key: string) {
    return store.has(key) ? store.get(key)! : null;
  },
  setItem(key: string, value: string) {
    store.set(key, String(value));
  },
  removeItem(key: string) {
    store.delete(key);
  },
  clear() {
    store.clear();
  },
  key(index: number) {
    return Array.from(store.keys())[index] ?? null;
  },
  get length() {
    return store.size;
  },
};

vi.stubGlobal('localStorage', localStorageMock);

// Ensure window.localStorage uses the same mock when window exists (happy-dom).
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).localStorage = localStorageMock;
}
