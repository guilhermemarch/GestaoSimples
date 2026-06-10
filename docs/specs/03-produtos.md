# Spec 03 — Cadastro de Produtos

**Referência:** [PRD](../prd/PRD.md) seções 3.3

## Objetivo

Permitir o gerenciamento de produtos com controle de estoque e preço.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-01 | Cadastrar produto com nome, preço e quantidade em estoque |
| RF-02 | Editar nome, preço e estoque de produto existente |
| RF-03 | Excluir produto sem vendas vinculadas |
| RF-04 | Impedir exclusão de produto presente em vendas |
| RF-05 | Listar produtos com nome, preço e estoque atual |
| RF-06 | Buscar produtos por nome |
| RF-07 | Impedir estoque negativo no cadastro manual |

## Modelo de dados (conceitual)

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| Nome | Sim | Nome do produto |
| Preço | Sim | Valor unitário (maior que zero) |
| Estoque | Sim | Quantidade disponível (≥ 0) |

## Casos de uso

### UC-01: Cadastrar produto

1. Usuário acessa área de produtos
2. Clica em "Novo produto"
3. Preenche nome, preço e estoque inicial
4. Confirma → produto aparece na listagem

### UC-02: Ajustar estoque

1. Usuário edita produto
2. Altera quantidade em estoque
3. Sistema valida que estoque não fica negativo

## Critérios de aceite

- [ ] Preço deve ser maior que zero
- [ ] Estoque não aceita valores negativos no formulário
- [ ] Listagem mostra estoque atual de cada produto
- [ ] Busca por nome funciona com correspondência parcial
- [ ] Exclusão bloqueada se produto está em alguma venda

## Fora do escopo

- Categorias de produtos
- Código de barras
- Imagens de produtos
