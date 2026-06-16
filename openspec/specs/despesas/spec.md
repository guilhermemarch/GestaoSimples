# despesas Specification

## Purpose
TBD - created by archiving change add-despesas. Update Purpose after archive.
## Requirements
### Requirement: Listar despesas
O sistema SHALL listar despesas via GET /api/expenses com filtros opcionais de status e período.

#### Scenario: Filtro por status
- **WHEN** GET /api/expenses?status=PENDING
- **THEN** retorna 200 apenas despesas pendentes da empresa

### Requirement: Criar despesa
O sistema SHALL criar despesa via POST /api/expenses com descrição e valor obrigatórios.

#### Scenario: Criação válida
- **WHEN** description e amount válidos
- **THEN** retorna 201 com categoria default OTHER se omitida

### Requirement: Atualizar e excluir despesa
O sistema SHALL permitir PUT e DELETE em /api/expenses/:id para registros da empresa.

#### Scenario: Despesa inexistente
- **WHEN** id não pertence à empresa
- **THEN** retorna 404

