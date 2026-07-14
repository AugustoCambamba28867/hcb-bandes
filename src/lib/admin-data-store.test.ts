import { beforeEach, describe, expect, it } from "vitest";
import { listOrders, listReports, listUsers, updateOrderStatus, upsertUser } from "./admin-data-store";

describe("admin data store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists order status updates", () => {
    const first = listOrders()[0];
    const next = updateOrderStatus(first.id, "aprovado");

    expect(next.find((order) => order.id === first.id)?.status).toBe("aprovado");
    expect(listOrders().find((order) => order.id === first.id)?.status).toBe("aprovado");
  });

  it("stores user changes and exposes reports", () => {
    const first = listUsers()[0];
    const saved = upsertUser({ ...first, email: "novo@email.com", status: "inactivo" });

    expect(saved.email).toBe("novo@email.com");
    expect(listUsers().find((user) => user.id === first.id)?.status).toBe("inactivo");
    expect(listReports().length).toBeGreaterThan(0);
  });
});
