import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { hash } from "bcryptjs";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000";

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = res.headers.get("set-cookie") ?? "";
  return { res, cookie };
}

function authHeaders(cookie: string) {
  return { Cookie: cookie.split(";")[0] };
}

describe.skipIf(!process.env.RUN_API_TESTS)("API smoke tests", () => {
  let adminCookie: string;
  let companyId: string;
  let customerId: string;
  let productId: string;

  beforeAll(async () => {
    const { res, cookie } = await login("admin@gestao.com", "admin123");
    expect(res.status).toBe(200);
    adminCookie = cookie;

    const me = await fetch(`${BASE}/api/auth/me`, { headers: authHeaders(adminCookie) });
    const meData = await me.json();
    companyId = meData.user.companyId;
  });

  it("GET /api/company returns company", async () => {
    const res = await fetch(`${BASE}/api/company`, { headers: authHeaders(adminCookie) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(companyId);
  });

  it("GET /api/customers returns list", async () => {
    const res = await fetch(`${BASE}/api/customers`, { headers: authHeaders(adminCookie) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    customerId = data[0]?.id;
  });

  it("GET /api/products returns list", async () => {
    const res = await fetch(`${BASE}/api/products`, { headers: authHeaders(adminCookie) });
    expect(res.status).toBe(200);
    const data = await res.json();
    productId = data[0]?.id;
  });

  it("GET /api/dashboard returns metrics", async () => {
    const res = await fetch(`${BASE}/api/dashboard`, { headers: authHeaders(adminCookie) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("salesToday");
  });

  it("GET /api/alertas returns alerts", async () => {
    const res = await fetch(`${BASE}/api/alertas`, { headers: authHeaders(adminCookie) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("alerts");
  });

  it("POST /api/sales creates sale with cash", async () => {
    if (!customerId || !productId) return;
    const res = await fetch(`${BASE}/api/sales`, {
      method: "POST",
      headers: { ...authHeaders(adminCookie), "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        paymentMethod: "CASH",
        items: [{ productId, quantity: 1 }],
        amountReceived: 100,
      }),
    });
    expect(res.status).toBe(201);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});

describe("auth helpers", () => {
  it("hashes passwords for seed", async () => {
    const h = await hash("test", 4);
    expect(h.length).toBeGreaterThan(10);
  });
});
