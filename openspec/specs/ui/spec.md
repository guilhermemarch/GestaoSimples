# ui Specification

## Purpose
TBD - UI specification for gestao-simples web app.
## Requirements
### Requirement: Design tokens e tema
A UI SHALL aplicar paleta, tipografia e espaçamento definidos em UIUX.md via variáveis CSS em `globals.css`.

#### Scenario: Tema carregado
- **WHEN** qualquer página autenticada é renderizada
- **THEN** cores primárias, fundo, texto e raios de borda seguem os tokens do design system

### Requirement: App shell autenticado
A UI SHALL envolver rotas internas em `AppShell` com navegação lateral, topbar e área de conteúdo responsiva.

#### Scenario: Navegação desktop
- **WHEN** o usuário acessa uma rota interna em viewport larga
- **THEN** sidebar fixa e topbar exibem links principais e contexto da página via `PageHeader`

#### Scenario: Navegação mobile
- **WHEN** o viewport é estreito
- **THEN** a navegação permanece acessível sem quebrar o layout de conteúdo (UIUX §5.2)

### Requirement: Componentes de sistema compartilhados
A UI SHALL expor componentes reutilizáveis para listagens, métricas, valores monetários, busca, estados vazios e status.

#### Scenario: Listagem padrão
- **WHEN** uma tela de lista usa `DataTable`
- **THEN** cabeçalhos, linhas e estado vazio seguem padrões de tabela UIUX §6.3

### Requirement: Cliente API
A UI SHALL usar `api-client` para chamadas HTTP autenticadas às rotas `/api/*` com parsing JSON e erros normalizados.

#### Scenario: Erro de API
- **WHEN** a API retorna status 4xx/5xx
- **THEN** o cliente propaga mensagem utilizável para toast ou formulário (UIUX §8.4)

### Requirement: Middleware de rotas
A UI SHALL proteger rotas autenticadas via `middleware.ts`, redirecionando usuários sem sessão para login.

#### Scenario: Acesso sem sessão
- **WHEN** usuário não autenticado acessa rota protegida
- **THEN** é redirecionado para `/login`

### Requirement: Tela de login
A UI SHALL oferecer página `/login` com e-mail, senha e ação de entrar alinhada a UIUX §7.1.

#### Scenario: Credenciais válidas
- **WHEN** o usuário envia credenciais corretas
- **THEN** a sessão é estabelecida e o usuário é redirecionado ao destino apropriado (dashboard ou onboarding)

#### Scenario: Credenciais inválidas
- **WHEN** a API retorna erro de autenticação
- **THEN** a UI exibe mensagem de erro sem limpar campos sensíveis indevidamente

### Requirement: Onboarding inicial
A UI SHALL guiar configuração inicial da empresa em `/onboarding` conforme UIUX §7.2.

#### Scenario: Empresa não configurada
- **WHEN** usuário autenticado sem empresa completa acessa área interna
- **THEN** é direcionado ao onboarding até concluir dados obrigatórios

### Requirement: Dashboard
A UI SHALL exibir `/dashboard` com métricas principais, atalhos e resumo de alertas (UIUX §7.3).

#### Scenario: Carregamento de KPIs
- **WHEN** o dashboard é aberto
- **THEN** cards de métricas e indicadores refletem dados da API de dashboard ou estado de carregamento explícito

### Requirement: UI de nova venda
A UI SHALL implementar fluxo de nova venda em `/vendas/nova` conforme UIUX §7.4.

#### Scenario: Finalizar venda
- **WHEN** o usuário confirma venda com itens e pagamento válidos
- **THEN** a UI chama API de vendas e exibe sucesso ou erro tratado

### Requirement: UI de clientes
A UI SHALL listar e detalhar clientes em `/clientes` e `/clientes/[id]` (UIUX §7.5).

#### Scenario: Busca de cliente
- **WHEN** o usuário digita na busca da lista
- **THEN** a tabela reflete filtro local ou remoto conforme implementação

### Requirement: UI de produtos
A UI SHALL listar e detalhar produtos em `/produtos` e `/produtos/[id]` (UIUX §7.6).

#### Scenario: Produto inativo
- **WHEN** produto está inativo
- **THEN** badge ou indicador visual distingue status (UIUX §6.4)

### Requirement: UI de estoque
A UI SHALL exibir `/estoque` com quantidades e destaque para itens críticos (UIUX §7.7).

#### Scenario: Estoque baixo
- **WHEN** saldo está abaixo do mínimo configurado
- **THEN** a UI destaca a linha ou badge de alerta

### Requirement: UI de caixa
A UI SHALL permitir visualizar sessão de caixa, registrar movimentos e acessar fechamento (UIUX §7.8).

#### Scenario: Caixa fechado
- **WHEN** não há sessão aberta
- **THEN** a UI orienta abertura com valor inicial

#### Scenario: Fechamento com diferença
- **WHEN** valor informado difere do esperado
- **THEN** a UI exige justificativa antes de submeter fechamento

### Requirement: UI financeiro
A UI SHALL oferecer área `/financeiro` e telas de contas a receber e despesas (UIUX §7.9).

#### Scenario: Listar recebíveis
- **WHEN** usuário abre contas a receber
- **THEN** tabela exibe status, valores (`MoneyValue`) e ações de baixa quando permitido

#### Scenario: Registrar despesa
- **WHEN** usuário cria despesa válida
- **THEN** lista atualiza após sucesso com feedback toast (UIUX §8.3)

### Requirement: UI de serviços
A UI SHALL gerenciar serviços em `/servicos` conforme UIUX §7.10.

#### Scenario: Criar serviço
- **WHEN** usuário salva serviço válido
- **THEN** item aparece na listagem com preço formatado via `MoneyValue`

### Requirement: UI de relatórios
A UI SHALL permitir gerar visualização de relatórios em `/relatorios` (UIUX §7.11).

#### Scenario: Aplicar filtros
- **WHEN** usuário seleciona período e tipo e solicita relatório
- **THEN** resultados são exibidos em tabela ou estado vazio (`EmptyState`)

### Requirement: UI de configurações
A UI SHALL expor `/configuracoes` para manutenção de dados da empresa e preferências visíveis ao usuário admin.

#### Scenario: Salvar configurações
- **WHEN** alterações válidas são enviadas
- **THEN** UI confirma sucesso e mantém valores atualizados na tela

