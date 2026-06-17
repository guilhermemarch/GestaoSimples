## Purpose

CRUD de clientes via API REST com busca e regras de exclusão.

## Requirements

### Requirement: Listar e buscar clientes
O sistema SHALL listar clientes via GET /api/customers com filtro opcional por nome (q).

#### Scenario: Listagem sem filtro
- **WHEN** o cliente solicita GET /api/customers
- **THEN** retorna 200 com lista ordenada por nome

#### Scenario: Busca por nome
- **WHEN** o cliente solicita GET /api/customers?q=maria
- **THEN** retorna 200 com clientes cujo nome contém o termo

### Requirement: Criar cliente
O sistema SHALL criar cliente via POST /api/customers com nome obrigatório.

#### Scenario: Criação válida
- **WHEN** o cliente envia nome e dados opcionais
- **THEN** retorna 201 com o cliente criado

#### Scenario: Nome ausente
- **WHEN** o cliente envia requisição sem nome
- **THEN** retorna 400

### Requirement: Obter, atualizar e excluir cliente
O sistema SHALL suportar GET, PUT e DELETE em /api/customers/:id.

#### Scenario: Cliente não encontrado
- **WHEN** o id não existe
- **THEN** retorna 404

#### Scenario: Exclusão com vendas vinculadas
- **WHEN** o cliente possui vendas
- **THEN** retorna 400 impedindo exclusão
