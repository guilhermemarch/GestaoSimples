# ADR 001 — Stack Técnica do MVP

**Status:** Aceito  
**Data:** 2025-06-15

## Contexto

O MVP precisa ser entregue em ~1 semana, com autenticação, CRUD de clientes/produtos, vendas com baixa de estoque e dashboard.

## Decisão

Adotar:

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Framework | Next.js 15 (App Router) | Fullstack em um repositório, rotas API integradas |
| Banco | SQLite + Prisma | Zero infra, setup rápido, adequado para demo/MVP |
| Auth | JWT em cookie httpOnly (jose) | Sessão segura sem dependência externa |
| UI | Tailwind CSS 4 | Estilização rápida e consistente |
| Testes | Vitest | Leve, integra com TypeScript |

## Alternativas consideradas

- **PostgreSQL:** Mais realista em produção, mas exige infra extra para o prazo
- **NextAuth:** Mais completo, porém complexidade desnecessária para 2 perfis fixos
- **HTML + Express:** Viável, mas Next.js unifica frontend e API

## Consequências

- Deploy simples (Vercel ou Node)
- SQLite não escala para múltiplos escritores simultâneos — aceitável para MVP acadêmico
- Migração futura para Postgres exige apenas alterar `DATABASE_URL` no Prisma
