// Dados simulados (mock) para o painel admin. Prontos para substituição por API.

export type Role =
  | "Super Administrator"
  | "Administrator"
  | "Manager"
  | "Supervisor"
  | "Operator"
  | "Finance"
  | "HR"
  | "Support"
  | "Guest";

export const ROLES: Role[] = [
  "Super Administrator",
  "Administrator",
  "Manager",
  "Supervisor",
  "Operator",
  "Finance",
  "HR",
  "Support",
  "Guest",
];

export const PERMISSION_MODULES = {
  Dashboard: ["View"],
  Utilizadores: ["View", "Create", "Edit", "Delete", "Export", "Import", "Manage"],
  Clientes: ["View", "Create", "Edit", "Delete"],
  Produtos: ["View", "Create", "Edit", "Delete"],
  Pedidos: ["View", "Approve", "Manage"],
  Financeiro: ["View", "Manage"],
  Relatórios: ["View", "Export"],
  "Base de Dados": ["View", "Manage"],
  Backup: ["Execute"],
  Definições: ["Manage"],
  Logs: ["View"],
} as const;

export type PermissionModule = keyof typeof PERMISSION_MODULES;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  role: Role;
  status: "activo" | "inactivo" | "suspenso";
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
  archived?: boolean;
}

const DEPARTMENTS = ["Direcção", "Comercial", "Operações", "Financeiro", "RH", "TI", "Jurídico"];
const POSITIONS = ["Director", "Gestor", "Analista", "Coordenador", "Assistente", "Consultor"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const NAMES: [string, string][] = [
  ["João", "Cardoso"],
  ["Maria", "Nsimba"],
  ["Ana", "Silva"],
  ["Pedro", "Almeida"],
  ["Cláudia", "Neto"],
  ["Rui", "Bandes"],
  ["Inês", "Domingos"],
  ["Marco", "Kiala"],
  ["Sara", "Bernardo"],
  ["Hélder", "Pinto"],
  ["Vânia", "Chissola"],
  ["Alberto", "Mateus"],
];

export const MOCK_USERS: User[] = NAMES.map(([f, l], i) => ({
  id: `usr-${(i + 1).toString().padStart(4, "0")}`,
  firstName: f,
  lastName: l,
  email: `${f.toLowerCase().replace(/[áàâã]/g, "a")}.${l.toLowerCase()}@hcb-bandes.ao`,
  phone: `+244 9${(30 + i).toString()} ${(100 + i * 7).toString().slice(0, 3)} ${(200 + i * 11).toString().slice(0, 3)}`,
  department: pick(DEPARTMENTS, i),
  position: pick(POSITIONS, i),
  role: pick(ROLES, i),
  status: (["activo", "activo", "activo", "inactivo", "suspenso"] as const)[i % 5],
  createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
  lastLogin: new Date(Date.now() - i * 3600_000 * 5).toISOString(),
}));

// Permissões por role (default). O utilizador pode ajustar na UI.
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, Partial<Record<PermissionModule, string[]>>> = {
  "Super Administrator": Object.fromEntries(
    Object.entries(PERMISSION_MODULES).map(([m, a]) => [m, [...a]]),
  ) as never,
  Administrator: {
    Dashboard: ["View"],
    Utilizadores: ["View", "Create", "Edit", "Delete", "Export", "Manage"],
    Clientes: ["View", "Create", "Edit", "Delete"],
    Produtos: ["View", "Create", "Edit"],
    Pedidos: ["View", "Approve", "Manage"],
    Financeiro: ["View"],
    Relatórios: ["View", "Export"],
    Definições: ["Manage"],
    Logs: ["View"],
  },
  Manager: {
    Dashboard: ["View"],
    Utilizadores: ["View"],
    Clientes: ["View", "Create", "Edit"],
    Produtos: ["View", "Edit"],
    Pedidos: ["View", "Approve"],
    Relatórios: ["View"],
  },
  Supervisor: {
    Dashboard: ["View"],
    Clientes: ["View", "Edit"],
    Pedidos: ["View"],
    Relatórios: ["View"],
  },
  Operator: { Dashboard: ["View"], Pedidos: ["View"] },
  Finance: { Dashboard: ["View"], Financeiro: ["View", "Manage"], Relatórios: ["View", "Export"] },
  HR: { Dashboard: ["View"], Utilizadores: ["View", "Create", "Edit"] },
  Support: { Dashboard: ["View"], Clientes: ["View"], Logs: ["View"] },
  Guest: { Dashboard: ["View"] },
};

// -------- Dashboard KPIs (mock) --------
export const DASHBOARD_STATS = {
  totalUsers: 248,
  administrators: 6,
  employees: 42,
  clients: 1_284,
  orders: 316,
  products: 87,
  categories: 12,
  revenue: 128_450_000, // AOA
  reports: 24,
  activities: 152,
};

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  type: "info" | "warn" | "success" | "error";
}

export const MOCK_ACTIVITIES: ActivityLog[] = [
  { id: "a1", actor: "Ana Silva", action: "criou utilizador", target: "Marco Kiala", at: new Date(Date.now() - 5 * 60_000).toISOString(), type: "success" },
  { id: "a2", actor: "João Cardoso", action: "actualizou permissões de", target: "Manager", at: new Date(Date.now() - 30 * 60_000).toISOString(), type: "info" },
  { id: "a3", actor: "Sistema", action: "backup automático concluído", target: "hcb_prod_2026_01_15", at: new Date(Date.now() - 2 * 3600_000).toISOString(), type: "success" },
  { id: "a4", actor: "Pedro Almeida", action: "eliminou lead", target: "lead-4821", at: new Date(Date.now() - 5 * 3600_000).toISOString(), type: "warn" },
  { id: "a5", actor: "Sistema", action: "tentativa de login falhada", target: "operador@teste.ao", at: new Date(Date.now() - 8 * 3600_000).toISOString(), type: "error" },
];

// -------- Base de dados (mock) --------
export interface DbTable {
  name: string;
  rows: number;
  size: string;
  lastUpdated: string;
}

export const MOCK_TABLES: DbTable[] = [
  { name: "users", rows: 248, size: "1.2 MB", lastUpdated: "há 2 min" },
  { name: "leads", rows: 84, size: "312 KB", lastUpdated: "há 8 min" },
  { name: "orders", rows: 316, size: "2.4 MB", lastUpdated: "há 1 h" },
  { name: "products", rows: 87, size: "540 KB", lastUpdated: "há 3 h" },
  { name: "partners", rows: 24, size: "180 KB", lastUpdated: "há 1 dia" },
  { name: "audit_logs", rows: 12_483, size: "18.6 MB", lastUpdated: "há 30 s" },
  { name: "sessions", rows: 156, size: "220 KB", lastUpdated: "há 1 min" },
  { name: "settings", rows: 32, size: "12 KB", lastUpdated: "há 2 dias" },
];

export const MOCK_BACKUPS = [
  { id: "b1", name: "backup_2026_01_15_auto.sql", size: "24.8 MB", type: "automático", at: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: "b2", name: "backup_2026_01_14_manual.sql", size: "24.6 MB", type: "manual", at: new Date(Date.now() - 26 * 3600_000).toISOString() },
  { id: "b3", name: "backup_2026_01_13_auto.sql", size: "24.5 MB", type: "automático", at: new Date(Date.now() - 50 * 3600_000).toISOString() },
];
