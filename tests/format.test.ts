import { describe, expect, it } from "vitest";
import { parseCsv, csvRowsToObjects } from "../src/lib/csv";
import { formatCurrency } from "../src/lib/format";

describe("formatCurrency", () => {
  it("formats BRL values", () => {
    expect(formatCurrency(12.5)).toContain("12");
  });
});

describe("parseCsv", () => {
  it("parses simple CSV rows", () => {
    const rows = parseCsv("nome,email\nMaria,maria@test.com");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(["nome", "email"]);
  });

  it("converts rows to objects", () => {
    const { records } = csvRowsToObjects(parseCsv("nome,preco\nCaneta,3"));
    expect(records[0].nome).toBe("Caneta");
    expect(records[0].preco).toBe("3");
  });
});
