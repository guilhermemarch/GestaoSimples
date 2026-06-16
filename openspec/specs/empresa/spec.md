# empresa Specification

## Purpose
TBD - created by archiving change add-empresa-usuarios. Update Purpose after archive.
## Requirements
### Requirement: Configuração da empresa
O sistema SHALL expor GET e PUT /api/company para a empresa do usuário autenticado.

#### Scenario: Consultar empresa
- **WHEN** usuário autenticado solicita GET /api/company
- **THEN** retorna dados da empresa vinculada

### Requirement: Gestão de usuários
O sistema SHALL permitir ADMIN listar e criar usuários via /api/users.

#### Scenario: Criar usuário
- **WHEN** admin envia e-mail, nome, senha e perfil
- **THEN** retorna 201 com usuário da mesma empresa

