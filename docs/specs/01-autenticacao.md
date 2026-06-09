# Spec 01 — Autenticação e Perfis

**Referência:** [PRD](../prd/PRD.md) seções 3.1 e 4.1

## Objetivo

Permitir que usuários acessem o sistema de forma segura, com perfis diferenciados de administrador e operador.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-01 | O sistema deve permitir login com e-mail e senha |
| RF-02 | O sistema deve rejeitar credenciais inválidas com mensagem clara |
| RF-03 | O sistema deve manter a sessão do usuário autenticado |
| RF-04 | O sistema deve permitir logout |
| RF-05 | O sistema deve redirecionar usuários não autenticados para a tela de login |
| RF-06 | O sistema deve suportar perfil **admin** com acesso total |
| RF-07 | O sistema deve suportar perfil **operador** com acesso a vendas, clientes e produtos |

## Casos de uso

### UC-01: Login

**Ator:** Usuário  
**Pré-condição:** Usuário possui credenciais cadastradas  
**Fluxo principal:**

1. Usuário informa e-mail e senha
2. Sistema valida credenciais
3. Sistema cria sessão e redireciona ao dashboard

**Fluxo alternativo — credenciais inválidas:**

1. Sistema exibe "E-mail ou senha incorretos"
2. Usuário pode tentar novamente

### UC-02: Logout

**Ator:** Usuário autenticado  
**Fluxo:** Usuário solicita sair → sistema encerra sessão → redireciona ao login

## Critérios de aceite

- [ ] Login com credenciais válidas redireciona ao dashboard
- [ ] Login com credenciais inválidas exibe erro sem revelar qual campo está errado
- [ ] Rotas protegidas bloqueiam acesso sem sessão
- [ ] Logout encerra sessão e impede acesso às rotas protegidas
- [ ] Usuário admin e operador conseguem fazer login

## Fora do escopo

- Recuperação de senha por e-mail
- Autenticação em dois fatores
- Cadastro público de usuários
