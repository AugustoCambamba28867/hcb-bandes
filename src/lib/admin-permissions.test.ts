import { describe, expect, it } from "vitest";
import { canAccessAdminModule, getAdminRole } from "@/lib/admin-permissions";

describe("canAccessAdminModule", () => {
  it("permite acesso de administrador aos módulos pedidos e relatórios", () => {
    expect(canAccessAdminModule("Administrator", "Relatórios", "View")).toBe(true);
    expect(canAccessAdminModule("Administrator", "Pedidos", "Approve")).toBe(true);
  });

  it("bloqueia acesso de operador a relatórios e pedidos", () => {
    expect(canAccessAdminModule("Operator", "Relatórios", "View")).toBe(false);
    expect(canAccessAdminModule("Operator", "Pedidos", "Approve")).toBe(false);
  });

  it("usa o papel padrão quando nenhum papel é fornecido", () => {
    expect(getAdminRole("")).toBe("Administrator");
  });
});
