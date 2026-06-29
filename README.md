# Gestão Simples

Sistema de gestão para micro e pequenas empresas — Trabalho Final AI Software Engineering.

GestãoSimples centraliza vendas, estoque, caixa, financeiro e ordens de serviço em uma interface única, pensada para o dia a dia de quem opera o negócio sem treinamento complexo.

**Stack:** Next.js 15 (App Router) · SQLite + Prisma · JWT em cookie · Tailwind CSS 4 · Vitest

---

## Telas do sistema

Mockups de referência visual versionados em [`docs/references/`](docs/references/). Índice completo: [docs/references/README.md](docs/references/README.md).

### Autenticação — `/login`, `/onboarding`

| Login | Hero | Onboarding |
|-------|------|------------|
| ![Login](docs/references/Login.png) | ![Login hero](docs/references/Login-hero.png) | ![Onboarding](docs/references/Onboarding.png) |

### Painel — `/dashboard`

![Dashboard](docs/references/Dashboard.png)

### Vendas e cadastros

| Nova venda `/vendas/nova` | Clientes `/clientes` | Detalhe do cliente `/clientes/[id]` |
|---------------------------|----------------------|-------------------------------------|
| ![Nova venda](docs/references/NovaVenda.png) | ![Clientes](docs/references/Clientes.png) | ![Detalhe do cliente](docs/references/DetalheDoCliente.png) |

| Produtos `/produtos` | Detalhe do produto `/produtos/[id]` | Estoque `/estoque` |
|----------------------|-------------------------------------|--------------------|
| ![Produtos](docs/references/Produtos.png) | ![Detalhe do produto](docs/references/DetalhesDoProduto.png) | ![Estoque](docs/references/Estoque.png) |

| Serviços `/servicos` |
|----------------------|
| ![Serviços](docs/references/Servicos.png) |

### Financeiro

| Hub `/financeiro` | Contas a receber `/financeiro/contas-a-receber` | Despesas `/financeiro/despesas` |
|-------------------|--------------------------------------------------|---------------------------------|
| ![Financeiro](docs/references/Financeiro.png) | ![Contas a receber](docs/references/ContasAReceber.png) | ![Despesas](docs/references/Despesas.png) |

### Caixa

| Caixa aberto `/caixa` | Fechamento `/caixa/fechamento` |
|-----------------------|--------------------------------|
| ![Caixa aberto](docs/references/CaixaAberto.png) | ![Fechamento de caixa](docs/references/FechamentoDeCaixa.png) |

### Gestão

| Relatórios `/relatorios` | Configurações `/configuracoes` |
|--------------------------|--------------------------------|
| ![Relatórios](docs/references/Relatorios.png) | ![Configurações](docs/references/Configuracoes.png) |

---

## Arquitetura

```mermaid
flowchart TB
  subgraph client [Browser]
    Pages[App Router pages]
  end
  subgraph next [Next.js]
    API[API Routes]
    MW[Middleware JWT]
  end
  subgraph data [Dados]
    Prisma[Prisma Client]
    SQLite[(SQLite)]
  end
  Pages --> API
  MW --> Pages
  API --> Prisma --> SQLite
```

Diagramas detalhados (modelo de dados, fluxos): [docs/diagrams/architecture.md](docs/diagrams/architecture.md).

### Domínios funcionais

```mermaid
flowchart LR
  subgraph operacao [Operacao]
    Vendas[Vendas PDV]
    Clientes[Clientes]
    Produtos[Produtos]
    Estoque[Estoque]
    Servicos[Ordens de servico]
  end
  subgraph financeiro [Financeiro]
    Hub[Hub financeiro]
    Receber[Contas a receber]
    Despesas[Despesas]
  end
  subgraph caixa [Caixa]
    Abertura[Caixa aberto]
    Fechamento[Fechamento]
  end
  subgraph gestao [Gestao]
    Dashboard[Dashboard]
    Relatorios[Relatorios]
    Config[Configuracoes]
  end
  Vendas --> caixa
  Vendas --> Receber
  Produtos --> Estoque
```

### Fluxo de venda

```mermaid
sequenceDiagram
  participant PDV as NovaVenda
  participant API as POST_api_sales
  participant DB as SQLite
  participant Caixa as CashSession
  PDV->>API: Itens + pagamento + cliente
  API->>DB: Criar Sale e SaleItems
  API->>DB: Baixar estoque StockMovement
  API->>Caixa: Registrar CashMovement
  API-->>PDV: Venda confirmada
```

---

## Páginas

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação |
| `/dashboard` | Painel principal |
| `/vendas/nova` | Registrar venda |
| `/clientes`, `/clientes/[id]` | Clientes |
| `/produtos`, `/produtos/[id]` | Produtos |
| `/estoque` | Estoque (5 abas) |
| `/caixa`, `/caixa/fechamento` | Caixa |
| `/financeiro` | Hub financeiro (abas: contas a receber, despesas, resultado) |
| `/financeiro/contas-a-receber` | Contas a receber |
| `/financeiro/despesas` | Despesas |
| `/servicos` | Ordens de serviço |
| `/relatorios` | Relatórios |
| `/configuracoes` | Empresa e usuários |

## API

Autenticação via cookie JWT (`gestao_session`). Login em `POST /api/auth/login`.

### Endpoints principais

| Domínio | Rotas |
|---------|-------|
| Auth | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` |
| Empresa | `/api/company` |
| Usuários | `/api/users` |
| Clientes | `/api/customers`, `/api/customers/:id` |
| Produtos | `/api/products`, `/api/products/:id` |
| Vendas | `/api/sales`, `/api/sales/:id` |
| Caixa | `/api/caixa/abrir`, `/api/caixa/fechar`, `/api/caixa/atual`, `/api/caixa/movimentos` |
| Contas a receber | `/api/receivables`, `/api/receivables/:id`, `/api/receivables/:id/pagar` |
| Despesas | `/api/expenses`, `/api/expenses/:id` |
| Estoque | `/api/stock-movements`, `/api/estoque/resumo` |
| Serviços | `/api/service-orders`, `/api/service-orders/:id`, `/status`, `/convert-sale` |
| Dashboard | `/api/dashboard` |
| Alertas | `/api/alertas` |
| Relatórios | `/api/relatorios/*` |
| Importação | `/api/import/clientes`, `/api/import/produtos` |

## Documentação

| Documento | Caminho |
|-----------|---------|
| PRD | [docs/prd/PRD.md](docs/prd/PRD.md) |
| UI/UX | [docs/prd/UIUX.md](docs/prd/UIUX.md) |
| Referências visuais | [docs/references/README.md](docs/references/README.md) |
| Diagramas | [docs/diagrams/architecture.md](docs/diagrams/architecture.md) |
| OpenSpec | [openspec/specs/](openspec/specs/) |
| ADR | [docs/adr/001-stack.md](docs/adr/001-stack.md) |
| Contexto IA | [agent.md](agent.md) |

## Pré-requisitos

- Node.js 20+
- npm

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm run scrape:products   # catálogo demo com fotos (São Roque)
npm run db:seed
npm run dev
```

API em [http://localhost:3000/api](http://localhost:3000/api)

## Produção local

```bash
npm run build
npm start
```

Defina `COOKIE_SECURE=true` no `.env` apenas se servir a aplicação via HTTPS.

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
| `npm start` | Servidor de produção (após build) |
| `npm run test` | Testes automatizados |
| `npm run db:push` | Sincronizar schema Prisma |
| `npm run scrape:products` | Baixar 30 produtos + imagens para o seed |
| `npm run db:seed` | Popular banco com dados demo |

## Estrutura

```
TrabalhoFinalEduardo/
├── demo-seed/             # Seed demo (fora do git): scrape, JSON, imagens, scripts
└── gestao-simples/        # Aplicação (repositório git)
    ├── openspec/          # Specs OpenSpec
    ├── docs/
    │   ├── prd/           # PRD e UIUX
    │   ├── references/    # PNGs de referência visual
    │   └── diagrams/      # Diagramas de arquitetura
    ├── prisma/            # Schema Prisma
    ├── public/images/     # login-hero; products/ sincronizado pelo scrape
    ├── src/
    │   ├── app/           # Páginas + API routes
    │   ├── components/    # layout, system, ui, charts
    │   └── lib/           # Auth, Prisma, api-client
    └── tests/             # Testes
```

## Equipe

| | Nome | GitHub |
|-|------|--------|
| | Guilherme | [@guilhermemarch](https://github.com/guilhermemarch) |
| | João | [@WezzoM](https://github.com/WezzoM) |
| | Thiago | [@ThiagoRuizSilva](https://github.com/ThiagoRuizSilva) |
| | Andrei | [@AndreiBertolo](https://github.com/AndreiBertolo) |
