# Plan — Módulo Clientes

**Spec:** [02-clientes.md](../specs/02-clientes.md)

## Tarefas

1. [ ] Modelo `Customer` (id, name, phone?, email?, createdAt)
2. [ ] API CRUD: `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/[id]`
3. [ ] Query param `?q=` para busca por nome
4. [ ] Validação: nome obrigatório
5. [ ] Bloquear DELETE se cliente tem vendas (relação com Sale)
6. [ ] Página `/clientes` — listagem, busca, modal/form de cadastro e edição
7. [ ] Feedback visual de sucesso/erro

## Critérios de conclusão

- CRUD completo conforme spec
- Busca parcial por nome
- Exclusão bloqueada com mensagem clara
