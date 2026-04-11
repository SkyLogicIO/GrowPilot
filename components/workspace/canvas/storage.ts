import type { WorkspaceCanvasDocument } from "./types";

const STORAGE_KEY = "growpilot_ecom_canvas_v1";

function loadAll(): Record<string, WorkspaceCanvasDocument> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(docs: Record<string, WorkspaceCanvasDocument>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.warn("[canvas storage] localStorage write failed:", err);
  }
}

export function loadCanvasDocument(threadId: string): WorkspaceCanvasDocument | null {
  const all = loadAll();
  return all[threadId] ?? null;
}

export function saveCanvasDocument(doc: WorkspaceCanvasDocument) {
  const all = loadAll();
  all[doc.threadId] = doc;
  saveAll(all);
}

export function deleteCanvasDocument(threadId: string) {
  const all = loadAll();
  delete all[threadId];
  saveAll(all);
}
