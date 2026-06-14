# Plan — Módulo Vendas e Dashboard

**Spec:** [04-vendas.md](../specs/04-vendas.md)

## Tarefas

1. [ ] Modelos `Sale` e `SaleItem` (saleId, productId, quantity, unitPrice, subtotal)
2. [ ] API `POST /api/sales` — transação: criar venda, itens, baixar estoque
3. [ ] API `GET /api/sales` — listagem com cliente e total
4. [ ] API `GET /api/sales/[id]` — detalhes com itens
5. [ ] API `GET /api/dashboard` — totais dia/mês, contadores
6. [ ] Página `/vendas` — nova venda (select cliente + produtos), listagem
7. [ ] Página `/dashboard` — cards com métricas
8. [ ] Validar estoque antes de confirmar venda

## Critérios de conclusão

- Venda com múltiplos itens e total correto
- Estoque atualizado atomicamente
- Dashboard reflete vendas e cadastros
