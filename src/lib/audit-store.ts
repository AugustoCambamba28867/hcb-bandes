import { MOCK_AUDIT_EVENTS, type AuditEvent } from "@/lib/mock-data";

const KEY = "hcb_audit_events_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStored(): AuditEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(events: AuditEvent[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("hcb_audit_changed"));
}

export function listAuditEvents(): AuditEvent[] {
  return [...readStored(), ...MOCK_AUDIT_EVENTS].sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function addAuditEvent(event: Omit<AuditEvent, "id" | "at"> & { at?: string }) {
  const next: AuditEvent = {
    ...event,
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: event.at ?? new Date().toISOString(),
  };
  writeStored([next, ...readStored()]);
  return next;
}
