# Diagramas — GestãoSimples

Diagramas de arquitetura e modelo de dados. Versões resumidas também aparecem no [README principal](../../README.md).

## Arquitetura em camadas

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

O middleware valida o cookie `gestao_session` (JWT) em rotas protegidas. Páginas server-side e API routes compartilham o mesmo processo Node.

## Modelo de dados (simplificado)

Entidades principais do schema Prisma:

```mermaid
erDiagram
  Company ||--o{ User : has
  Company ||--o{ Customer : has
  Company ||--o{ Product : has
  Company ||--o{ Sale : has
  Company ||--o{ CashSession : has
  Company ||--o{ Receivable : has
  Company ||--o{ Expense : has
  Company ||--o{ ServiceOrder : has

  Customer ||--o{ Sale : places
  Customer ||--o{ Receivable : owes
  Customer ||--o{ ServiceOrder : requests

  Product ||--o{ SaleItem : sold_in
  Product ||--o{ StockMovement : tracks

  Sale ||--|{ SaleItem : contains
  Sale }o--o| CashSession : linked_to
  Sale }o--o| Receivable : generates
  Sale ||--o{ CashMovement : records

  CashSession ||--o{ CashMovement : has
  CashSession }o--|| User : opened_by

  ServiceOrder ||--o{ ServiceOrderItem : contains
  ServiceOrder }o--o| Sale : converts_to
```

## Fluxo de venda

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

Pagamento pendente gera `Receivable` em vez de movimento imediato no caixa.

## Domínios funcionais

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

## Referências

- Schema completo: [`prisma/schema.prisma`](../../prisma/schema.prisma)
- ADR stack: [`docs/adr/001-stack.md`](../adr/001-stack.md)
- OpenSpec: [`openspec/specs/`](../../openspec/specs/)
