## Purpose

CRUD de produtos com controle de estoque via API REST.

## Requirements

### Requirement: Listar e buscar produtos
O sistema SHALL listar produtos via GET /api/products com filtro opcional por nome (q).

#### Scenario: Listagem
- **WHEN** o cliente solicita GET /api/products
- **THEN** retorna 200 com lista de produtos

### Requirement: Criar produto
O sistema SHALL criar produto via POST /api/products com nome, preço e estoque válidos.

#### Scenario: Criação válida
- **WHEN** nome, preço > 0 e estoque >= 0 são enviados
- **THEN** retorna 201

#### Scenario: Dados inválidos
- **WHEN** preço ou estoque são inválidos
- **THEN** retorna 400

### Requirement: Atualizar e excluir produto
O sistema SHALL suportar GET, PUT e DELETE em /api/products/:id.

#### Scenario: Exclusão com vendas vinculadas
- **WHEN** o produto possui itens de venda
- **THEN** retorna 400 impedindo exclusão
