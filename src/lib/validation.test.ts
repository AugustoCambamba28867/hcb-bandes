import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/validation";

const base = {
  nome: "Ana Silva",
  email: "ana@example.com",
  telefone: "+244 935 105 538",
  empresa: "HCB",
  perfil: "Empresa empregadora" as const,
  mensagem: "Gostaria de saber mais sobre o modelo profissional.",
};

describe("contactSchema", () => {
  it("aceita dados válidos", () => {
    const r = contactSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rejeita nome demasiado curto", () => {
    const r = contactSchema.safeParse({ ...base, nome: "A" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toContain("nome");
  });

  it("rejeita nome com caracteres inválidos", () => {
    const r = contactSchema.safeParse({ ...base, nome: "Ana123 <script>" });
    expect(r.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const r = contactSchema.safeParse({ ...base, email: "sem-arroba" });
    expect(r.success).toBe(false);
  });

  it("aceita telefone vazio", () => {
    const r = contactSchema.safeParse({ ...base, telefone: "" });
    expect(r.success).toBe(true);
  });

  it("rejeita telefone com letras", () => {
    const r = contactSchema.safeParse({ ...base, telefone: "abc123" });
    expect(r.success).toBe(false);
  });

  it("aceita telefone Angola sem prefixo", () => {
    const r = contactSchema.safeParse({ ...base, telefone: "935105538" });
    expect(r.success).toBe(true);
  });

  it("rejeita perfil não permitido", () => {
    const r = contactSchema.safeParse({ ...base, perfil: "Hacker" as never });
    expect(r.success).toBe(false);
  });

  it("rejeita mensagem com menos de 10 caracteres", () => {
    const r = contactSchema.safeParse({ ...base, mensagem: "Curta" });
    expect(r.success).toBe(false);
  });

  it("rejeita mensagem com mais de 1000 caracteres", () => {
    const r = contactSchema.safeParse({ ...base, mensagem: "a".repeat(1001) });
    expect(r.success).toBe(false);
  });

  it("empresa é opcional", () => {
    const { empresa, ...rest } = base;
    void empresa;
    const r = contactSchema.safeParse(rest);
    expect(r.success).toBe(true);
  });
});
