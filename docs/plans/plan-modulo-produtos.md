# Plan — Módulo Produtos

**Spec:** [03-produtos.md](../specs/03-produtos.md)

## Tarefas

1. [ ] Modelo `Product` (id, name, price, stock, createdAt)
2. [ ] API CRUD: `GET/POST /api/products`, `GET/PUT/DELETE /api/products/[id]`
3. [ ] Validação: preço > 0, estoque >= 0
4. [ ] Bloquear DELETE se produto está em SaleItem
5. [ ] Página `/produtos` — listagem com estoque, busca, formulário
6. [ ] Formatação de preço em BRL na UI

## Critérios de conclusão

- CRUD completo conforme spec
- Estoque exibido na listagem
- Validações de preço e estoque
