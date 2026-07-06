// Máscaras de input (aplicadas onChange).

export function maskPhoneAO(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 12);
  // +244 9XX XXX XXX
  if (digits.startsWith("244")) {
    const rest = digits.slice(3);
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 6);
    const p3 = rest.slice(6, 9);
    return ["+244", p1, p2, p3].filter(Boolean).join(" ").trim();
  }
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 6);
  const p3 = digits.slice(6, 9);
  return [p1, p2, p3].filter(Boolean).join(" ").trim();
}

// BI Angola: 9 dígitos + 2 letras + 3 dígitos (ex.: 004596754LA043)
export function maskBI(v: string): string {
  const raw = v.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 14);
  return raw;
}

export function maskNIF(v: string): string {
  return v.replace(/\D/g, "").slice(0, 10);
}

export function maskCurrencyAOA(v: string): string {
  const digits = v.replace(/\D/g, "");
  if (!digits) return "";
  const n = Number(digits) / 100;
  return n.toLocaleString("pt-PT", {
    style: "currency",
    currency: "AOA",
    minimumFractionDigits: 2,
  });
}

export function maskPercent(v: string): string {
  const digits = v.replace(/\D/g, "").slice(0, 3);
  if (!digits) return "";
  return `${Math.min(100, Number(digits))}%`;
}

export function maskDatePT(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 4);
  const p3 = d.slice(4, 8);
  return [p1, p2, p3].filter(Boolean).join("/");
}
