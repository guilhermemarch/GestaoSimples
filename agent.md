# agent.md — GestãoSimples

Contexto global do projeto para agentes de IA.

## O que é este projeto

**GestãoSimples** é um sistema de gestão para micro e pequenas empresas. Permite controlar clientes, produtos, vendas e visualizar um dashboard com resumo do negócio.

## Público

Donos e funcionários de pequenos negócios (lojas, oficinas, prestadores de serviço) com até ~10 pessoas.

## Módulos do MVP

1. **Autenticação** — login, logout, perfis admin/operador
2. **Clientes** — CRUD e busca
3. **Produtos** — CRUD, estoque, preço
4. **Vendas** — criar venda, itens, baixa de estoque
5. **Dashboard** — totais do dia/mês, contadores

## Documentação

| Documento | Caminho | Propósito |
|-----------|---------|-----------|
| PRD | `docs/prd/PRD.md` | O quê e por quê (negócio) |
| Specs | `docs/specs/` | Requisitos detalhados por módulo |
| Plans | `docs/plans/` | Como implementar cada módulo |
| ADRs | `docs/adr/` | Decisões arquiteturais |

## Regras para a IA

- Consultar o PRD antes de implementar qualquer funcionalidade
- Implementar apenas o que está na spec do módulo atual
- Não adicionar features fora do escopo do MVP (ver PRD seção "Fora do escopo")
- Seguir `rules/architecture-rules.md` e `rules/backend-rules.md`
- Separar requisito (spec) de implementação (código)

## Fluxo de trabalho

```
PRD → Spec → Plan → Implementação → Testes → Review
```

Nenhuma feature começa diretamente pelo código.

## Convenções de código

- Código em `src/`
- Testes em `tests/`
- Mensagens de commit: `feat:`, `docs:`, `test:`, `fix:`, `chore:`
