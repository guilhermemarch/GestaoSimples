# Spec 02 — Cadastro de Clientes

**Referência:** [PRD](../prd/PRD.md) seções 3.2 e 4.2

## Objetivo

Permitir o gerenciamento completo de clientes da empresa.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-01 | Cadastrar cliente com nome (obrigatório) e telefone/e-mail (opcional) |
| RF-02 | Editar dados de cliente existente |
| RF-03 | Excluir cliente sem vendas vinculadas |
| RF-04 | Impedir exclusão de cliente com vendas registradas |
| RF-05 | Listar todos os clientes em ordem alfabética |
| RF-06 | Buscar clientes por nome (parcial) |

## Modelo de dados (conceitual)

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Nome | Sim | Nome do cliente |
| Telefone | Não | Contato telefônico |
| E-mail | Não | Contato por e-mail |
| Data de cadastro | Automático | Quando foi criado |

## Casos de uso

### UC-01: Cadastrar cliente

1. Usuário acessa área de clientes
2. Clica em "Novo cliente"
3. Preenche nome e contatos
4. Confirma → sistema salva e exibe na listagem

### UC-02: Buscar cliente

1. Usuário digita termo na busca
2. Sistema filtra clientes cujo nome contém o termo
3. Resultados atualizados em tempo real

## Critérios de aceite

- [ ] Cadastro exige nome; campos opcionais podem ficar vazios
- [ ] Edição persiste alterações corretamente
- [ ] Exclusão bloqueada se cliente tem vendas
- [ ] Busca retorna resultados parciais (ex.: "Sil" encontra "Silva")
- [ ] Listagem exibe todos os clientes cadastrados

## Fora do escopo

- Histórico detalhado de compras por cliente (apenas vínculo com vendas)
- Importação em massa de clientes
