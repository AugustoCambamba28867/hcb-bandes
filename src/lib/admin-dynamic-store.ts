import { addAuditEvent } from "./audit-store";
import { MOCK_AUDIT_EVENTS, MOCK_ORDERS, MOCK_REPORTS, MOCK_USERS, type AuditEvent, type Order, type OrderStatus, type ReportItem, type User } from "./mock-data";
import { isSupabaseConfigured } from "./supabase-client";
import { listAuditEventsFromSupabase, listOrdersFromSupabase, listReportsFromSupabase, listUsersFromSupabase, saveAuditEventToSupabase, saveOrderToSupabase, saveReportToSupabase, saveUserToSupabase } from "./supabase-data";

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
    return Array.isArray(parsed) ? parsed : fallback;
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
  return MOCK_ORDERS.map((order) => ({ ...order }));
}

function getUsersSeed(): User[] {
  return MOCK_USERS.map((user) => ({ ...user }));
}

function getReportsSeed(): ReportItem[] {
  return MOCK_REPORTS.map((report) => ({ ...report }));
}

function mergeAuditEvents(local: AuditEvent[], remote: AuditEvent[]): AuditEvent[] {
  return [...remote, ...local, ...MOCK_AUDIT_EVENTS]
    .filter((event, index, array) => array.findIndex((candidate) => candidate.id === event.id) === index)
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

async function syncOrdersFromSupabase() {
  if (!(await isSupabaseConfigured())) return;
  try {
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

export function upsertUser(user: User): User {
  const current = listUsers();
  const next = [...current];
  const index = next.findIndex((entry) => entry.id === user.id);
  const saved = { ...user };
  if (index >= 0) {
    next[index] = saved;
  } else {
    next.unshift(saved);
  }
  writeStorage(USERS_KEY, next);
  void (async () => {
    if (await isSupabaseConfigured()) {
      await saveUserToSupabase(saved);
    }
  })();
  addAuditEvent({
    actor: "Administrador",
    action: "actualizou utilizador",
    target: `${saved.firstName} ${saved.lastName}`,
    details: `Dados guardados para ${saved.email}.`,
    type: "info",
  });
  return saved;
}

export function listAuditEventsDynamic(): AuditEvent[] {
  void syncAuditEventsFromSupabase();
  const local = readStorage<AuditEvent[]>(AUDIT_EVENTS_KEY, []);
  return mergeAuditEvents(local, []);
}
