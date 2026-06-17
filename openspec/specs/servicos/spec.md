# servicos Specification

## Purpose
TBD - created by archiving change add-servicos. Update Purpose after archive.
## Requirements
### Requirement: Listar ordens de serviço
O sistema SHALL listar ordens via GET /api/service-orders com filtros opcionais.

#### Scenario: Listagem
- **WHEN** usuário autenticado solicita GET /api/service-orders
- **THEN** retorna ordens da empresa ordenadas por atualização

### Requirement: Criar ordem de serviço
O sistema SHALL criar ordem via POST /api/service-orders com cliente e descrição.

#### Scenario: Criação válida
- **WHEN** cliente e descrição são enviados
- **THEN** retorna 201 com status QUOTE e histórico inicial

### Requirement: Atualizar status
O sistema SHALL registrar transições via POST /api/service-orders/:id/status.

#### Scenario: Mudança de status
- **WHEN** novo status válido é enviado
- **THEN** atualiza ordem e cria entrada no histórico

### Requirement: Converter em venda
O sistema SHALL converter ordem concluída via POST /api/service-orders/:id/convert-sale.

#### Scenario: Conversão
- **WHEN** ordem está COMPLETED ou DELIVERED
- **THEN** cria venda, baixa estoque e vincula saleId

