# GestãoSimples

Sistema de gestão para micro e pequenas empresas — Trabalho Final AI Software Engineering.

## Funcionalidades

- Autenticação (admin e operador)
- Cadastro de clientes
- Cadastro de produtos com estoque
- Registro de vendas com baixa automática de estoque
- Dashboard com totais do dia/mês

## Documentação

| Documento | Caminho |
|-----------|---------|
| PRD | [docs/prd/PRD.md](docs/prd/PRD.md) |
| Specs | [docs/specs/](docs/specs/) |
| Plans | [docs/plans/](docs/plans/) |
| ADR | [docs/adr/001-stack.md](docs/adr/001-stack.md) |
| Contexto IA | [agent.md](agent.md) |

## Pré-requisitos

- Node.js 20+
- npm

## Setup

```bash
# Clonar e instalar
npm install

# Configurar ambiente
cp .env.example .env

# Criar banco e dados iniciais
npm run db:push
npm run db:seed

# Desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Credenciais de demonstração

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Admin | admin@gestao.com | admin123 |
| Operador | operador@gestao.com | operador123 |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run test` | Testes automatizados |
| `npm run db:push` | Sincronizar schema Prisma |
| `npm run db:seed` | Popular banco com dados demo |

## Estrutura do projeto

```
gestao-simples/
├── agent.md          # Contexto global para IA
├── docs/             # PRD, specs, plans, ADRs
├── rules/            # Regras arquiteturais
├── prisma/           # Schema e seed
├── src/              # Código Next.js
└── tests/            # Testes
```

## Equipe

- Guilherme (guilhermemarch)
- João (WezzoM)
- Thiago (ThiagoRuizSilva)
- Andrei (AndreiBertolo)
