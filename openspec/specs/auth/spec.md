## Purpose

Autenticação e sessão via API REST com perfis de acesso.
## Requirements
### Requirement: Login com e-mail e senha
O sistema SHALL autenticar usuários via POST /api/auth/login com e-mail e senha válidos.

#### Scenario: Credenciais válidas
- **WHEN** o cliente envia e-mail e senha corretos
- **THEN** retorna 200 com dados do usuário e define cookie de sessão

#### Scenario: Credenciais inválidas
- **WHEN** o cliente envia credenciais incorretas
- **THEN** retorna 401 com mensagem de erro

### Requirement: Sessão autenticada
O sistema SHALL expor GET /api/auth/me para retornar o usuário da sessão atual.

#### Scenario: Sessão válida
- **WHEN** o cliente possui cookie de sessão válido
- **THEN** retorna 200 com dados do usuário

#### Scenario: Sem sessão
- **WHEN** o cliente não possui cookie válido
- **THEN** retorna 401

### Requirement: Logout
O sistema SHALL encerrar a sessão via POST /api/auth/logout.

#### Scenario: Logout bem-sucedido
- **WHEN** o cliente solicita logout
- **THEN** retorna 200 e remove o cookie de sessão

### Requirement: Proteção de rotas API
Rotas /api/* (exceto login) SHALL exigir autenticação.

#### Scenario: Acesso sem autenticação
- **WHEN** o cliente acessa rota protegida sem cookie
- **THEN** retorna 401

### Requirement: Sessão com empresa
A resposta de login e GET /api/auth/me SHALL incluir companyId.

#### Scenario: Login com empresa
- **WHEN** login bem-sucedido
- **THEN** retorna user.companyId

