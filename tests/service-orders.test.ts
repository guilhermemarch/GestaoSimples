import { describe, expect, it } from "vitest";
import { SERVICE_STATUS_LABELS } from "../src/lib/constants";

describe("service order constants", () => {
  it("has labels for all statuses", () => {
    expect(SERVICE_STATUS_LABELS.QUOTE).toBe("Orçamento");
    expect(SERVICE_STATUS_LABELS.IN_PROGRESS).toBe("Em andamento");
  });
});
