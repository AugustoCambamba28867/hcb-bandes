import { addAuditEvent } from "./audit-store";
import { MOCK_AUDIT_EVENTS, MOCK_ORDERS, MOCK_REPORTS, MOCK_USERS, type AuditEvent, type Order, type OrderStatus, type ReportItem, type User } from "./mock-data";
import { isSupabaseConfigured, supabaseEnabled } from "./supabase-client";
import { ensureSupabaseSchema, listAuditEventsFromSupabase, listOrdersFromSupabase, listReportsFromSupabase, listUsersFromSupabase, saveAuditEventToSupabase, saveOrderToSupabase, saveReportToSupabase, saveUserToSupabase, saveUserPasswordToSupabase } from "./supabase-data";

const ORDERS_KEY = "hcb_orders_v1";
const USERS_KEY = "hcb_users_v1";
const REPORTS_KEY = "hcb_reports_v1";
const AUDIT_EVENTS_KEY = "hcb_audit_events_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed == null) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event("hcb_admin_data_changed"));
}

function getOrdersSeed(): Order[] {
  if (supabaseEnabled) return [];
  return MOCK_ORDERS.map((order) => ({ ...order }));
}

function getUsersSeed(): User[] {
  if (supabaseEnabled) return [];
  return MOCK_USERS.map((user) => ({ ...user }));
}

function getReportsSeed(): ReportItem[] {
  if (supabaseEnabled) return [];
  return MOCK_REPORTS.map((report) => ({ ...report }));
}

function mergeAuditEvents(local: AuditEvent[], remote: AuditEvent[]): AuditEvent[] {
  const baseEvents = supabaseEnabled ? [] : MOCK_AUDIT_EVENTS;
  const filteredLocal = supabaseEnabled
    ? local.filter((event) => !event.id.startsWith("aud-") && !/^a\d+$/.test(event.id))
    : local;
  return [...remote, ...filteredLocal, ...baseEvents]
    .filter((event, index, array) => array.findIndex((candidate) => candidate.id === event.id) === index)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

async function syncOrdersFromSupabase() {
  if (!(await isSupabaseConfigured())) return;
  try {
    await ensureSupabaseSchema();
    const remote = await listOrdersFromSupabase();
    if (remote.length > 0) {
      writeStorage(ORDERS_KEY, remote);
    }
  } catch (error) {
    console.warn("Failed to sync orders from Supabase", error);
  }
}

async function syncReportsFromSupabase() {
  if (!(await isSupabaseConfigured())) return;
  try {
    await ensureSupabaseSchema();
    const remote = await listReportsFromSupabase();
    if (remote.length > 0) {
      writeStorage(REPORTS_KEY, remote);
    }
  } catch (error) {
    console.warn("Failed to sync reports from Supabase", error);
  }
}

async function syncUsersFromSupabase() {
  if (!(await isSupabaseConfigured())) return;
  try {
    await ensureSupabaseSchema();
    const remote = await listUsersFromSupabase();
    if (remote.length > 0) {
      writeStorage(USERS_KEY, remote);
    }
  } catch (error) {
    console.warn("Failed to sync users from Supabase", error);
  }
}

async function syncAuditEventsFromSupabase() {
  if (!(await isSupabaseConfigured())) return;
  try {
    await ensureSupabaseSchema();
    const remote = await listAuditEventsFromSupabase();
    if (remote.length > 0) {
      const local = readStorage<AuditEvent[]>(AUDIT_EVENTS_KEY, []);
      writeStorage(AUDIT_EVENTS_KEY, mergeAuditEvents(local, remote));
    }
  } catch (error) {
    console.warn("Failed to sync audit events from Supabase", error);
  }
}

export function listOrders(): Order[] {
  const stored = readStorage<Order[]>(ORDERS_KEY, []);
  if (stored.length > 0) {
    return stored.map((order) => ({ ...order }));
  }

  const fallback = getOrdersSeed();
  writeStorage(ORDERS_KEY, fallback);
  void syncOrdersFromSupabase();
  return fallback;
}

export function listReports(): ReportItem[] {
  const stored = readStorage<ReportItem[]>(REPORTS_KEY, []);
  if (stored.length > 0) {
    return stored.map((report) => ({ ...report }));
  }

  const fallback = getReportsSeed();
  writeStorage(REPORTS_KEY, fallback);
  void syncReportsFromSupabase();
  return fallback;
}

export function listUsers(): User[] {
  const stored = readStorage<User[]>(USERS_KEY, []);
  if (stored.length > 0) {
    return stored.map((user) => ({ ...user }));
  }

  const fallback = getUsersSeed();
  writeStorage(USERS_KEY, fallback);
  void syncUsersFromSupabase();
  return fallback;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order[] {
  const current = listOrders();
  const next = current.map((order) => (order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order));
  writeStorage(ORDERS_KEY, next);
  const order = next.find((entry) => entry.id === id);
  void (async () => {
    if (await isSupabaseConfigured()) {
      await Promise.all(next.filter((entry) => entry.id === id).map((entry) => saveOrderToSupabase(entry)));
    }
  })();
  addAuditEvent({
    actor: "Administrador",
    action: status === "aprovado" ? "aprovou pedido" : status === "rejeitado" ? "rejeitou pedido" : status === "concluido" ? "concluiu pedido" : "actualizou pedido",
    target: order?.reference ?? id,
    details: `Estado alterado para ${status}.`,
    type: status === "rejeitado" || status === "cancelado" ? "warning" : "success",
  });
  return next;
}

export async function upsertUserAsync(user: User & { password?: string }): Promise<User> {
  const current = listUsers();
  const next = [...current];
  const index = next.findIndex((entry) => entry.id === user.id);
  const { password, ...userWithoutPassword } = user;
  const saved = { ...userWithoutPassword };

  const savedWithPasswordHash = {
    ...saved,
    ...(password ? { password_hash: password } : {}),
  } as any;

  if (index >= 0) {
    const existing = next[index] as any;
    if (!password && existing.password_hash) {
      savedWithPasswordHash.password_hash = existing.password_hash;
    }
    next[index] = savedWithPasswordHash;
  } else {
    next.unshift(savedWithPasswordHash);
  }
  writeStorage(USERS_KEY, next);

  if (await isSupabaseConfigured()) {
    try {
      await saveUserToSupabase(saved);
      if (password) {
        await saveUserPasswordToSupabase(user.id, password);
      }
    } catch (err) {
      console.warn("Failed to save user to Supabase", err);
    }
  }

  addAuditEvent({
    actor: "Administrador",
    action: password ? "actualizou utilizador e senha" : "actualizou utilizador",
    target: `${saved.firstName} ${saved.lastName}`,
    details: `Dados guardados para ${saved.email}.`,
    type: "info",
  });
  return savedWithPasswordHash;
}

export function upsertUser(user: User & { password?: string }): User {
  void upsertUserAsync(user);
  const current = listUsers();
  const next = [...current];
  const index = next.findIndex((entry) => entry.id === user.id);
  const { password, ...userWithoutPassword } = user;
  const saved = { ...userWithoutPassword };
  const savedWithPasswordHash = { ...saved, ...(password ? { password_hash: password } : {}) } as any;
  if (index >= 0) {
    next[index] = savedWithPasswordHash;
  } else {
    next.unshift(savedWithPasswordHash);
  }
  writeStorage(USERS_KEY, next);
  return savedWithPasswordHash;
}

export function listAuditEventsDynamic(): AuditEvent[] {
  void syncAuditEventsFromSupabase();
  const local = readStorage<AuditEvent[]>(AUDIT_EVENTS_KEY, []);
  return mergeAuditEvents(local, []);
}

export async function listOrdersDynamic(): Promise<Order[]> {
  if (await isSupabaseConfigured()) {
    const remote = await fetchOrdersRemote();
    if (remote !== null) {
      return remote;
    }
  }
  return listOrders();
}

export async function listReportsDynamic(): Promise<ReportItem[]> {
  if (await isSupabaseConfigured()) {
    const remote = await fetchReportsRemote();
    if (remote !== null) {
      return remote;
    }
  }
  return listReports();
}

export async function listUsersDynamic(): Promise<User[]> {
  if (await isSupabaseConfigured()) {
    const remote = await fetchUsersRemote();
    if (remote !== null) {
      return remote;
    }
  }
  return listUsers();
}

export async function listAuditEventsDynamicAsync(): Promise<AuditEvent[]> {
  if (await isSupabaseConfigured()) {
    const remote = await fetchAuditEventsRemote();
    if (remote !== null) {
      return remote;
    }
  }
  return listAuditEventsDynamic();
}

// Remote-first helpers: attempt to fetch from Supabase and return remote data if available.
export async function fetchOrdersRemote(): Promise<Order[] | null> {
  if (!(await isSupabaseConfigured())) return null;
  try {
    await ensureSupabaseSchema();
    const remote = await listOrdersFromSupabase();
    writeStorage(ORDERS_KEY, remote);
    return remote;
  } catch (error) {
    console.warn("Failed to fetch remote orders", error);
  }
  return null;
}

export async function fetchReportsRemote(): Promise<ReportItem[] | null> {
  if (!(await isSupabaseConfigured())) return null;
  try {
    await ensureSupabaseSchema();
    const remote = await listReportsFromSupabase();
    writeStorage(REPORTS_KEY, remote);
    return remote;
  } catch (error) {
    console.warn("Failed to fetch remote reports", error);
  }
  return null;
}

export async function fetchUsersRemote(): Promise<User[] | null> {
  if (!(await isSupabaseConfigured())) return null;
  try {
    await ensureSupabaseSchema();
    const remote = await listUsersFromSupabase();
    const local = readStorage<User[]>(USERS_KEY, []);

    // Merge: remote takes precedence over local by user id
    const map = new Map<string, User>();
    for (const u of local) {
      if (u?.id) map.set(u.id, u);
    }
    for (const u of remote) {
      if (u?.id) map.set(u.id, u);
    }

    const merged = Array.from(map.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    writeStorage(USERS_KEY, merged);
    return merged;
  } catch (error) {
    console.warn("Failed to fetch remote users", error);
  }
  return null;
}

export async function fetchAuditEventsRemote(): Promise<AuditEvent[] | null> {
  if (!(await isSupabaseConfigured())) return null;
  try {
    await ensureSupabaseSchema();
    const remote = await listAuditEventsFromSupabase();
    const local = readStorage<AuditEvent[]>(AUDIT_EVENTS_KEY, []);
    const merged = mergeAuditEvents(local, remote);
    writeStorage(AUDIT_EVENTS_KEY, merged);
    return merged;
  } catch (error) {
    console.warn("Failed to fetch remote audit events", error);
  }
  return null;
}

export async function upsertReport(report: ReportItem): Promise<ReportItem> {
  const current = readStorage<ReportItem[]>(REPORTS_KEY, []);
  const idx = current.findIndex((r) => r.id === report.id);
  const next = [...current];
  if (idx >= 0) {
    next[idx] = report;
  } else {
    next.unshift(report);
  }
  writeStorage(REPORTS_KEY, next);

  if (await isSupabaseConfigured()) {
    try {
      await saveReportToSupabase(report);
    } catch (err) {
      console.warn("Failed to save report to Supabase", err);
    }
  }

  addAuditEvent({
    actor: "Administrador",
    action: idx >= 0 ? "actualizou relatorio" : "gerou relatorio",
    target: report.title,
    details: `Relatorio "${report.title}" (${report.category}) para o periodo ${report.period}.`,
    type: "info",
  });

  return report;
}

