# Plan — Módulo Autenticação

**Spec:** [01-autenticacao.md](../specs/01-autenticacao.md)

## Stack

- Next.js 15 App Router
- Prisma + SQLite
- Sessão via cookie httpOnly (JWT ou ID de sessão)

## Tarefas

1. [ ] Modelo `User` (id, email, passwordHash, role: ADMIN | OPERATOR, name)
2. [ ] Seed com usuário admin e operador de demonstração
3. [ ] API `POST /api/auth/login` — validar credenciais, criar sessão
4. [ ] API `POST /api/auth/logout` — destruir sessão
5. [ ] API `GET /api/auth/me` — retornar usuário logado
6. [ ] Middleware protegendo rotas `/dashboard`, `/clientes`, `/produtos`, `/vendas`
7. [ ] Página `/login` com formulário e tratamento de erro
8. [ ] Layout autenticado com botão de logout

## Critérios de conclusão

- Login/logout funcionando
- Rotas protegidas redirecionam para `/login`
- Perfis admin e operador persistidos no banco
