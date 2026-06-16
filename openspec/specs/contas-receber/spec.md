# contas-receber Specification

## Purpose
TBD - created by archiving change add-contas-receber. Update Purpose after archive.
## Requirements
### Requirement: Listar contas a receber
O sistema SHALL listar recebíveis via GET /api/receivables com filtro opcional `status`.

#### Scenario: Listagem
- **WHEN** usuário com acesso financeiro solicita GET /api/receivables
- **THEN** retorna 200 ordenado por vencimento com cliente e pagamentos

### Requirement: Criar conta a receber
O sistema SHALL criar recebível via POST /api/receivables com cliente, descrição, valor e vencimento.

#### Scenario: Criação válida
- **WHEN** campos obrigatórios presentes e cliente da empresa
- **THEN** retorna 201 com status calculado

### Requirement: Baixar conta
O sistema SHALL registrar pagamento via POST /api/receivables/:id/pagar.

#### Scenario: Pagamento parcial
- **WHEN** amount positivo e não excede saldo
- **THEN** retorna 200 com `paidAmount` atualizado e status PARTIAL ou PAID

#### Scenario: Pagamento excedente
- **WHEN** amount faz paidAmount ultrapassar amount da conta
- **THEN** retorna 400

### Requirement: Excluir conta avulsa
O sistema SHALL permitir DELETE /api/receivables/:id apenas se não houver `saleId`.

#### Scenario: Conta vinculada a venda
- **WHEN** recebível possui saleId
- **THEN** retorna 400

