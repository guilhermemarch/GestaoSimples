# Regras de Arquitetura

## Princípios

- Separar requisitos de negócio (PRD/specs) de decisões técnicas (ADR/plans).
- Cada módulo deve ser implementável de forma independente após sua spec aprovada.
- Manter o escopo do MVP restrito aos quatro módulos: autenticação, clientes, produtos e vendas.

## Estrutura

- `docs/` — documentação de produto e engenharia
- `src/` — código da aplicação
- `tests/` — testes automatizados

## Fluxo de desenvolvimento

1. PRD aprovado
2. Spec do módulo
3. Plan de implementação
4. Código + revisão
