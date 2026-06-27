import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "gestao_session";
const PUBLIC_API_PATHS = ["/api/auth/login"];
const PUBLIC_PAGES = ["/", "/login"];

const AUTH_PAGES = [
  "/dashboard",
  "/onboarding",
  "/clientes",
  "/produtos",
  "/vendas",
  "/estoque",
  "/caixa",
  "/financeiro",
  "/servicos",
  "/relatorios",
  "/configuracoes",
];

async function isValidToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return false;
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(COOKIE_NAME);
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API_PATHS.some((p) => pathname === p)) {
      return NextResponse.next();
    }
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    if (!(await isValidToken(token))) {
      return NextResponse.json({ error: "Sessão inválida" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isPublicPage = PUBLIC_PAGES.includes(pathname);
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (pathname === "/login" && token) {
    if (await isValidToken(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    const response = NextResponse.next();
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  if (isAuthPage) {
    if (!token) {
      return redirectToLogin(request);
    }
    if (!(await isValidToken(token))) {
      return redirectToLogin(request);
    }
  }

  if (!isPublicPage && !isAuthPage && pathname !== "/login") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
