# PRD — GestãoSimples

Product Requirements Document do sistema de gestão para pequenas empresas.

---

## 1. Problema

Pequenos negócios — como lojas de bairro, oficinas mecânicas e prestadores de serviço autônomos — ainda controlam clientes, estoque e vendas usando planilhas, cadernos ou anotações soltas.

Essa forma de trabalho gera:

- **Erros de registro** — vendas anotadas incorretamente ou esquecidas
- **Conflitos de estoque** — produtos vendidos sem controle atualizado
- **Retrabalho** — busca manual de informações de clientes e histórico
- **Falta de visão do negócio** — o dono não sabe quanto vendeu no dia ou no mês sem somar manualmente

A solução é necessária porque esses empreendedores precisam de um sistema simples e centralizado para organizar o dia a dia do negócio, sem a complexidade de ferramentas corporativas.

---

## 2. Público-alvo

**Usuários principais:**

- **Donos de micro e pequenas empresas** (até aproximadamente 10 funcionários) que precisam controlar vendas e cadastros sem equipe de TI
- **Funcionários operacionais** (vendedores, atendentes) que registram vendas e consultam clientes no dia a dia

**Contexto de uso:**

- Ambiente comercial com rotina de atendimento ao cliente
- Usuários com familiaridade básica com computador ou celular
- Necessidade de agilidade — o sistema deve ser intuitivo e rápido de usar durante o expediente

**Exemplo concreto:** Dono de uma pequena papelaria que atende clientes, controla estoque de produtos e precisa saber o faturamento diário sem depender de planilhas.

---

## 3. Funcionalidades

### 3.1 Autenticação e perfis

- Realizar login com credenciais de acesso
- Encerrar sessão de forma segura
- Diferenciar perfis de **administrador** (acesso total) e **operador** (registro de vendas e consultas)

### 3.2 Cadastro de clientes

- Cadastrar novos clientes com nome e contato
- Editar dados de clientes existentes
- Excluir clientes que não possuem vínculos ativos
- Buscar clientes por nome
- Visualizar lista de todos os clientes cadastrados

### 3.3 Cadastro de produtos

- Cadastrar produtos com nome, preço e quantidade em estoque
- Editar informações de produtos
- Excluir produtos sem vendas vinculadas
- Buscar produtos por nome
- Visualizar lista de produtos com estoque atual

### 3.4 Registro de vendas

- Criar nova venda associada a um cliente
- Adicionar um ou mais produtos à venda
- Calcular automaticamente o valor total da venda
- Atualizar o estoque após confirmação da venda
- Listar vendas realizadas com data, cliente e valor
- Consultar detalhes de uma venda específica

### 3.5 Dashboard

- Visualizar total de vendas do dia
- Visualizar total de vendas do mês
- Visualizar quantidade de clientes cadastrados
- Visualizar quantidade de produtos em estoque

---

## 4. Fluxos

### 4.1 Fluxo de login

1. Usuário acessa a tela inicial do sistema
2. Usuário informa e-mail e senha
3. Sistema valida as credenciais
4. Se válidas, usuário é direcionado ao painel principal
5. Se inválidas, sistema exibe mensagem de erro e permite nova tentativa

### 4.2 Fluxo de cadastrar cliente

1. Usuário autenticado acessa a área de clientes
2. Usuário seleciona a opção de novo cadastro
3. Usuário preenche nome e dados de contato
4. Usuário confirma o cadastro
5. Sistema salva o cliente e exibe confirmação
6. Cliente passa a aparecer na listagem

### 4.3 Fluxo de registrar venda

1. Usuário autenticado acessa a área de vendas
2. Usuário inicia uma nova venda
3. Usuário seleciona o cliente da venda
4. Usuário adiciona produtos e quantidades
5. Sistema exibe o valor total calculado
6. Usuário confirma a venda
7. Sistema registra a venda, atualiza o estoque e exibe confirmação

### 4.4 Fluxo de consultar dashboard

1. Usuário autenticado acessa o painel principal
2. Sistema exibe totais de vendas do dia e do mês
3. Sistema exibe resumo de clientes e produtos cadastrados
4. Usuário pode navegar para as demais áreas do sistema a partir do painel

---

## Fora do escopo (MVP)

- Emissão de nota fiscal
- Integração com meios de pagamento
- Relatórios avançados e exportação
- Múltiplas filiais ou unidades
- Aplicativo mobile nativo
