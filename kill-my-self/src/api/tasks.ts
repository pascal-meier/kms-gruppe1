
// Schnittstelle zum Backend
export type Tasks = {
    id: number;
    title: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
};

export async function GetAllTasks(): Promise<Tasks[]> {
    const response = await fetch("/api/tasks");
    if (!response.ok) throw new Error("Fehler beim Laden der Aufgaben");
    return response.json();
}