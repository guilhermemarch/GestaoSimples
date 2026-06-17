# importacao Specification

## Purpose
TBD - created by archiving change add-importacao-csv. Update Purpose after archive.
## Requirements
### Requirement: Importar clientes CSV
O sistema SHALL criar clientes via POST /api/import/clientes a partir de texto CSV.

#### Scenario: Linha sem nome
- **WHEN** linha não possui nome/name
- **THEN** adiciona entrada em errors e continua demais linhas

#### Scenario: Importação parcial
- **WHEN** CSV válido com algumas linhas corretas
- **THEN** retorna 200 com imported, errors e customers criados

### Requirement: Importar produtos CSV
O sistema SHALL criar produtos via POST /api/import/produtos a partir de texto CSV.

#### Scenario: Preço inválido
- **WHEN** linha sem preço válido
- **THEN** registra erro na linha sem criar produto

#### Scenario: CSV vazio
- **WHEN** body.csv ausente ou vazio
- **THEN** retorna 400

