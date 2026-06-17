# relatorios Specification

## Purpose
TBD - created by archiving change add-relatorios-simples. Update Purpose after archive.
## Requirements
### Requirement: Relatório por tipo
O sistema SHALL expor GET /api/relatorios/:tipo com dados agregados da empresa no período informado.

#### Scenario: Tipo válido
- **WHEN** tipo é vendas, vendas-por-pagamento, produtos-mais-vendidos, estoque-baixo, contas-atraso, despesas-categoria ou resultado-mensal
- **THEN** retorna 200 com payload JSON específico do tipo

#### Scenario: Tipo inválido
- **WHEN** tipo não reconhecido
- **THEN** retorna 404

### Requirement: Exportação CSV
O sistema SHALL retornar text/csv quando format=csv e o resultado for array de objetos.

#### Scenario: CSV de estoque baixo
- **WHEN** GET /api/relatorios/estoque-baixo?format=csv
- **THEN** retorna corpo CSV com cabeçalhos das colunas

