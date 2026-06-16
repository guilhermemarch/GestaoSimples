# alertas Specification

## Purpose
TBD - created by archiving change add-alertas-internos. Update Purpose after archive.
## Requirements
### Requirement: Listar alertas internos
O sistema SHALL expor GET /api/alertas com alertas da empresa do usuário autenticado.

#### Scenario: Estoque baixo
- **WHEN** produto ativo tem stock <= minStock
- **THEN** inclui alerta type LOW_STOCK severity warning

#### Scenario: Conta vencida
- **WHEN** existe Receivable status OVERDUE
- **THEN** inclui alerta type OVERDUE_RECEIVABLE

#### Scenario: Caixa aberto prolongado
- **WHEN** sessão OPEN há mais de 12 horas
- **THEN** inclui alerta type CASH_STILL_OPEN severity info

#### Scenario: Resposta agregada
- **WHEN** GET /api/alertas conclui
- **THEN** retorna 200 com array alerts e count igual ao tamanho do array

