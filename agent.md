# agent.md — GestãoSimples

Contexto global do projeto para agentes de IA.

## Demo

- Login: `admin@gestao.com` / `admin123`
- Operador: `operador@gestao.com` / `operador123`
- Referências visuais: `docs/references/*.png` (versionadas no repositório)

## Catálogo de produtos (São Roque)

30 produtos reais com fotos, preços e categorias:

```bash
npm run scrape:products   # baixa JSON + imagens (fonte: supermercadosaoroque.com.br)
npm run db:seed           # repovoa banco com catálogo scrapeado
```

- JSON: `../demo-seed/scraped-products.json`
- Imagens: `../demo-seed/images/products/` (sync para `public/images/products/` no scrape)

## Volumes do seed (`npm run db:seed`)

| Entidade | Qtd |
|----------|-----|
| Clientes | 10 |
| Produtos | 30 |
| Vendas | ~67 |
| Contas a receber | 20 |
| Pagamentos recebidos | ~15 |
| Despesas | ~23 |
| Ordens de serviço | 16 |
| Sessões de caixa | 2 |

## Telas principais

| Rota | Descrição |
|------|-----------|
| `/dashboard` | Painel com KPIs |
| `/vendas/nova` | PDV |
| `/clientes`, `/produtos`, `/estoque` | Cadastros operacionais |
| `/caixa`, `/caixa/fechamento` | Caixa |
| `/financeiro` | Hub financeiro (3 abas) |
| `/servicos` | Ordens de serviço (kanban) |
| `/relatorios` | Relatórios e export CSV |
| `/configuracoes` | Empresa, usuários, integrações |

## Comandos

```bash
npm run scrape:products
npm run db:seed
npm run dev
npm run build
npm start
npm test
```

## Documentação

- PRD: `docs/prd/PRD.md`
- Referências visuais: `docs/references/README.md`
- Diagramas: `docs/diagrams/architecture.md`
- ADR stack: `docs/adr/001-stack.md`
- OpenSpec: `openspec/specs/`

## Fora de escopo

Upload de imagem pelo usuário, NF-e e WhatsApp real (apenas toggles/mock local).
