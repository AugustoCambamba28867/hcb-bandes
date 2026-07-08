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

// -------- Pedidos (mock) --------
export type OrderStatus =
  | "pendente"
  | "aprovado"
  | "em_processamento"
  | "concluido"
  | "rejeitado"
  | "cancelado";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  em_processamento: "Em processamento",
  concluido: "Concluído",
  rejeitado: "Rejeitado",
  cancelado: "Cancelado",
};

export interface Order {
  id: string;
  reference: string;
  client: string;
  email: string;
  service: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const SERVICES = [
  "Plano Profissional",
  "Plano Familiar",
  "Plano Condomínio",
  "Consultoria Institucional",
  "Assistência Técnica",
  "Serviço Personalizado",
];

const CLIENTS: [string, string][] = [
  ["Domingos Bernardo", "domingos.bernardo@empresa.ao"],
  ["Marta Kiala", "marta.kiala@gmail.com"],
  ["Condomínio Talatona", "geral@cond-talatona.ao"],
  ["Isaías Pinto", "isaias.p@outlook.com"],
  ["Sofia Neves", "sofia.neves@empresa.ao"],
  ["Alberto Mateus", "alberto@mateus.co.ao"],
  ["Grupo Kianda", "financas@grupokianda.ao"],
  ["Helena Bandes", "helena.b@empresa.ao"],
  ["Rui Domingos", "rui.d@yahoo.com"],
  ["Vânia Chissola", "vania.c@empresa.ao"],
  ["Marco Silva", "marco.silva@empresa.ao"],
  ["Ana Cardoso", "ana.cardoso@gmail.com"],
  ["Condomínio Miramar", "gestao@miramar.ao"],
  ["João Pereira", "joao.p@empresa.ao"],
  ["Cláudia Neto", "claudia.n@empresa.ao"],
  ["Pedro Almeida", "pedro.a@empresa.ao"],
  ["Sara Bernardo", "sara.b@gmail.com"],
  ["Hélder Pinto", "helder.p@empresa.ao"],
  ["Inês Domingos", "ines.d@empresa.ao"],
  ["Rita Alves", "rita.a@empresa.ao"],
  ["Bruno Costa", "bruno.c@empresa.ao"],
  ["Carla Ferreira", "carla.f@empresa.ao"],
  ["Diogo Martins", "diogo.m@empresa.ao"],
  ["Eva Ribeiro", "eva.r@empresa.ao"],
  ["Fábio Sousa", "fabio.s@empresa.ao"],
];

const ORDER_STATUSES: OrderStatus[] = [
  "pendente", "pendente", "pendente",
  "aprovado", "aprovado",
  "em_processamento", "em_processamento",
  "concluido", "concluido", "concluido",
  "rejeitado", "cancelado",
];

export const MOCK_ORDERS: Order[] = CLIENTS.map(([client, email], i) => {
  const created = Date.now() - i * 86400000 * 1.7;
  return {
    id: `ord-${(i + 1).toString().padStart(4, "0")}`,
    reference: `HCB-${(2026000 + i + 1).toString()}`,
    client,
    email,
    service: pick(SERVICES, i),
    amount: 45_000 + (i % 12) * 32_500 + (i % 5) * 12_000,
    status: ORDER_STATUSES[i % ORDER_STATUSES.length],
    createdAt: new Date(created).toISOString(),
    updatedAt: new Date(created + 3600_000 * (i % 24)).toISOString(),
  };
});

// -------- Relatórios (mock) --------
export type ReportCategory =
  | "financeiro"
  | "operacional"
  | "comercial"
  | "recursos_humanos"
  | "auditoria";

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  financeiro: "Financeiro",
  operacional: "Operacional",
  comercial: "Comercial",
  recursos_humanos: "Recursos Humanos",
  auditoria: "Auditoria",
};

export interface ReportItem {
  id: string;
  title: string;
  category: ReportCategory;
  period: string;
  author: string;
  records: number;
  generatedAt: string;
  status: "publicado" | "rascunho" | "arquivado";
}

const REPORT_TITLES: [string, ReportCategory][] = [
  ["Receita mensal consolidada", "financeiro"],
  ["Fluxo de caixa semanal", "financeiro"],
  ["Contas a receber — atrasadas", "financeiro"],
  ["Pedidos por serviço", "comercial"],
  ["Leads convertidos por origem", "comercial"],
  ["Taxa de conversão trimestral", "comercial"],
  ["Actividade dos operadores", "operacional"],
  ["Tempo médio de atendimento", "operacional"],
  ["Backups e integridade da BD", "operacional"],
  ["Colaboradores por departamento", "recursos_humanos"],
  ["Registo de férias e ausências", "recursos_humanos"],
  ["Logs de acesso administrativo", "auditoria"],
  ["Tentativas de login falhadas", "auditoria"],
  ["Alterações de permissões", "auditoria"],
  ["Exportações de dados sensíveis", "auditoria"],
  ["Receita por perfil de cliente", "financeiro"],
  ["Utilizadores activos vs inactivos", "recursos_humanos"],
  ["Parceiros por estado contratual", "comercial"],
];

const REPORT_STATUSES: ReportItem["status"][] = [
  "publicado", "publicado", "publicado", "rascunho", "arquivado",
];

export const MOCK_REPORTS: ReportItem[] = REPORT_TITLES.map(([title, category], i) => ({
  id: `rpt-${(i + 1).toString().padStart(4, "0")}`,
  title,
  category,
  period: `${((i % 12) + 1).toString().padStart(2, "0")}/2026`,
  author: pick(["Ana Silva", "João Cardoso", "Sistema", "Pedro Almeida", "Sara Bernardo"], i),
  records: 32 + (i * 41) % 980,
  generatedAt: new Date(Date.now() - i * 86400000 * 2.3).toISOString(),
  status: REPORT_STATUSES[i % REPORT_STATUSES.length],
}));

// -------- Auditoria (mock) --------
export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  details: string;
  at: string;
  type: "info" | "warning" | "success" | "error";
}

export const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "aud-0001",
    actor: "Ana Silva",
    action: "aprovou pedido",
    target: "HCB-2026004",
    details: "Pedido do Plano Profissional validado para seguimento financeiro.",
    at: new Date(Date.now() - 35 * 60_000).toISOString(),
    type: "success",
  },
  {
    id: "aud-0002",
    actor: "João Cardoso",
    action: "exportou relatórios",
    target: "Relatórios",
    details: "Exportação CSV de relatórios financeiros e operacionais.",
    at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    type: "info",
  },
  {
    id: "aud-0003",
    actor: "Pedro Almeida",
    action: "rejeitou pedido",
    target: "HCB-2026011",
    details: "Pedido rejeitado por documentação insuficiente.",
    at: new Date(Date.now() - 5 * 3600_000).toISOString(),
    type: "warning",
  },
  {
    id: "aud-0004",
    actor: "Sara Bernardo",
    action: "concluiu pedido",
    target: "HCB-2026008",
    details: "Processo marcado como concluído depois da validação administrativa.",
    at: new Date(Date.now() - 9 * 3600_000).toISOString(),
    type: "success",
  },
  {
    id: "aud-0005",
    actor: "Sistema",
    action: "bloqueou acesso",
    target: "/admin/relatorios",
    details: "Acesso negado por falta de permissão de visualização.",
    at: new Date(Date.now() - 18 * 3600_000).toISOString(),
    type: "error",
  },
];

// Utilitário partilhado de download CSV.
export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8;") {
  if (typeof window === "undefined") return;
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toCSV(rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(escape).join(",")).join("\r\n");
}

