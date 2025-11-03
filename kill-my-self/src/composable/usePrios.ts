import { ref } from "vue";

const PRIOS_KEY = "priorities_csv";
const PRIO_HEADERS = ["key", "label", "weight"];

export type Prio = { key: string; label: string; weight: number };
const prios = ref<Prio[]>([]);

function toCSV(list: Prio[], headers: string[]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.join(",");
  const body = list.map(r => headers.map(h => esc(r[h as keyof Prio])).join(",")).join("\n");
  return [head, body].filter(Boolean).join("\n");
}

function parseCSVLine(line: string) {
  const out: string[] = [];
  let cur = "", i = 0, inQuotes = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      cur += ch; i++; continue
    } else {
      if (ch === '"') { inQuotes = true; i++; continue }
      if (ch === ',') { out.push(cur); cur = ""; i++; continue }
      cur += ch; i++; continue
    }
  }
  out.push(cur);
  return out;
}

function fromCSV(csv: string) {
  if (!csv.trim()) return { headers: [], rows: [] };
  const lines = csv.split(/\r?\n/);
  const headers = parseCSVLine(lines.shift() || "");
  const rows = lines.filter(Boolean).map(line => {
    const vals = parseCSVLine(line);
    const obj: any = {};
    headers.forEach((h, i) => obj[h] = vals[i] ?? "");
    return obj;
  });
  return { headers, rows };
}

function loadPrios() {
  const csv = localStorage.getItem(PRIOS_KEY) || '';
  if (!csv) {
    prios.value = [
      { key: 'high', label: 'Hoch', weight: 1 },
      { key: 'medium', label: 'Mittel', weight: 2 },
      { key: 'low', label: 'Niedrig', weight: 3 }
    ];
    return;
  }
  const { rows } = fromCSV(csv);
  prios.value = rows.map((r: any) => ({
    key: r.key,
    label: r.label,
    weight: Number(r.weight),
  }));
}

function savePrios() {
  localStorage.setItem(PRIOS_KEY, toCSV(prios.value, PRIO_HEADERS));
}

function addPrio(newPrio: Prio) {
  prios.value.push({ ...newPrio });
  savePrios();
}

function deletePrio(key: string) {
  prios.value = prios.value.filter((p) => p.key !== key);
  savePrios();
}

loadPrios();

export function usePrios() {
  return {
    prios,
    addPrio,
    deletePrio,
    loadPrios,
  };
}
