import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory, Outlet } from "@tanstack/react-router";
import { Route as AdminRoute } from "@/routes/admin";
import { Route as AdminIndexRoute } from "@/routes/admin.index";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

function buildRouter(initial = "/admin") {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const admin = createRoute({
    getParentRoute: () => rootRoute,
    path: "/admin",
    component: AdminRoute.options.component!,
    head: AdminRoute.options.head,
  });
  const adminIndex = createRoute({
    getParentRoute: () => admin,
    path: "/",
    component: AdminIndexRoute.options.component!,
  });
  const routeTree = rootRoute.addChildren([admin.addChildren([adminIndex])]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("admin route", () => {
  it("mostra ecrã de login quando não autenticado", async () => {
    const router = buildRouter();
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      expect(screen.getByText(/Painel Admin/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Palavra-passe/i)).toBeInTheDocument();
    expect(screen.getByText(/Manter sessão iniciada/i)).toBeInTheDocument();
  });

  it("erro ao introduzir palavra-passe incorrecta", async () => {
    const router = buildRouter();
    render(<RouterProvider router={router} />);
    await waitFor(() => screen.getByLabelText(/Palavra-passe/i));
    fireEvent.change(screen.getByLabelText(/Palavra-passe/i), {
      target: { value: "errada" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    await waitFor(
      () => {
        expect(screen.getByText(/incorrecta/i)).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("entra no dashboard com palavra-passe correcta", async () => {
    const router = buildRouter();
    render(<RouterProvider router={router} />);
    await waitFor(() => screen.getByLabelText(/Palavra-passe/i));
    fireEvent.change(screen.getByLabelText(/Palavra-passe/i), {
      target: { value: "hcb2026" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Entrar/i }));
    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    // botão de logout visível
    expect(screen.getByLabelText(/Terminar sessão/i)).toBeInTheDocument();
  });

  it("permanece autenticado após remontagem (sessão persistente)", async () => {
    // Simula login prévio
    window.localStorage.setItem(
      "hcb_admin_auth_v2",
      JSON.stringify({
        loggedInAt: Date.now(),
        expiresAt: Date.now() + 3600_000,
        rememberMe: false,
      }),
    );
    const router = buildRouter();
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
    });
  });
});
