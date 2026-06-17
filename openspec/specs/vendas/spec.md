## Purpose

Registro de vendas com baixa automática de estoque via API REST.
## Requirements
### Requirement: Listar vendas
O sistema SHALL listar vendas via GET /api/sales com filtro opcional por `paymentMethod` e incluir `payments`.

#### Scenario: Filtro por forma de pagamento
- **WHEN** GET /api/sales?paymentMethod=PIX
- **THEN** retorna 200 apenas vendas com esse método principal

### Requirement: Criar venda
O sistema SHALL registrar venda via POST /api/sales com cliente, itens e forma(s) de pagamento, persistindo `SalePayment` e aplicando regras de caixa e contas a receber.

#### Scenario: Venda em dinheiro com caixa aberto
- **WHEN** POST /api/sales com `paymentMethod` CASH e existe `CashSession` OPEN da empresa
- **THEN** retorna 201, grava `amountReceived`/`changeAmount` se informados e cria `CashMovement` tipo SALE

#### Scenario: Venda em dinheiro sem caixa
- **WHEN** POST /api/sales com pagamento CASH e não há caixa aberto
- **THEN** retorna 400 com mensagem de caixa fechado

#### Scenario: Venda a prazo
- **WHEN** POST /api/sales com `paymentMethod` ou parcela PENDING e `dueDate` opcional
- **THEN** retorna 201 e cria `Receivable` vinculado à venda

#### Scenario: Pagamentos múltiplos
- **WHEN** POST /api/sales com array `payments` de métodos e valores
- **THEN** retorna 201 com registros `payments` cuja soma reflete o total da venda

### Requirement: Detalhe da venda
O sistema SHALL retornar venda via GET /api/sales/:id.

#### Scenario: Venda não encontrada
- **WHEN** o id não existe
- **THEN** retorna 404

