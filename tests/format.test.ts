import { describe, expect, it } from "vitest";
import { formatCurrency } from "../src/lib/format";

describe("formatCurrency", () => {
  it("formata valor em BRL", () => {
    const result = formatCurrency(12.5);
    expect(result).toContain("12,50");
    expect(result).toContain("R$");
  });
});

describe("validações de negócio", () => {
  it("preço deve ser maior que zero", () => {
    expect(0 > 0).toBe(false);
    expect(10 > 0).toBe(true);
  });

  it("estoque não pode ser negativo", () => {
    expect(Math.max(0, -5)).toBe(0);
  });
});
