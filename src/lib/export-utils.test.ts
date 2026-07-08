import { describe, expect, it } from "vitest";
import { buildCsvContent } from "@/lib/export-utils";

describe("buildCsvContent", () => {
  it("gera cabeçalhos e linhas corretamente", () => {
    const csv = buildCsvContent([
      ["ID", "Nome"],
      ["1", "Ana"],
    ]);

    expect(csv).toContain("ID,Nome");
    expect(csv).toContain("1,Ana");
  });
});
