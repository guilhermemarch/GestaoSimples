## Purpose

Métricas agregadas do negócio via GET /api/dashboard.
## Requirements
### Requirement: Totais de vendas
O sistema SHALL retornar vendas do dia e do mês, contagem de vendas do dia e ticket médio do dia via GET /api/dashboard.

#### Scenario: Consulta dashboard
- **WHEN** o cliente autenticado solicita GET /api/dashboard
- **THEN** retorna salesToday, salesMonth, salesCountToday e averageTicketToday

### Requirement: Contadores
O sistema SHALL retornar quantidade de clientes e produtos cadastrados, itens com estoque baixo e estado do caixa.

#### Scenario: Contadores
- **WHEN** o cliente solicita GET /api/dashboard
- **THEN** retorna customerCount, productCount e lowStockCount

#### Scenario: Caixa aberto
- **WHEN** existe CashSession OPEN da empresa
- **THEN** retorna cashOpen true e estimatedCashBalance

### Requirement: Indicadores financeiros por perfil
O sistema SHALL incluir métricas financeiras adicionais no GET /api/dashboard apenas para ADMIN e MANAGER.

#### Scenario: Gestor consulta dashboard
- **WHEN** role é ADMIN ou MANAGER
- **THEN** retorna pendingReceivables, overdueReceivablesCount, monthExpenses, topProducts e paymentMethodsMonth

