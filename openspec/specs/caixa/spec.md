# caixa Specification

## Purpose
TBD - created by archiving change add-caixa. Update Purpose after archive.
## Requirements
### Requirement: Abrir caixa
O sistema SHALL permitir abrir sessão via POST /api/caixa/abrir para a empresa do usuário.

#### Scenario: Abertura válida
- **WHEN** não existe sessão OPEN e é enviado `openingAmount`
- **THEN** retorna 201 com `CashSession` status OPEN

#### Scenario: Caixa já aberto
- **WHEN** já existe sessão OPEN da empresa
- **THEN** retorna 400

### Requirement: Consultar caixa atual
O sistema SHALL expor GET /api/caixa/atual com sessão aberta, movimentos e totais por forma de pagamento das vendas.

#### Scenario: Sem caixa aberto
- **WHEN** não há sessão OPEN
- **THEN** retorna `{ open: false, session: null }`

### Requirement: Fechar caixa
O sistema SHALL fechar sessão via POST /api/caixa/fechar calculando valor esperado e diferença.

#### Scenario: Diferença sem justificativa
- **WHEN** `closingAmount` difere do esperado e `justification` está vazio
- **THEN** retorna 400

#### Scenario: Fechamento válido
- **WHEN** há sessão OPEN e regras de justificativa são atendidas
- **THEN** retorna 200 com sessão CLOSED e campos de conferência

### Requirement: Movimentos de caixa
O sistema SHALL listar e registrar movimentos via GET/POST /api/caixa/movimentos na sessão aberta.

#### Scenario: Movimento manual
- **WHEN** POST com type REINFORCEMENT, WITHDRAWAL ou EXPENSE e amount positivo
- **THEN** retorna 201 com movimento na sessão atual

