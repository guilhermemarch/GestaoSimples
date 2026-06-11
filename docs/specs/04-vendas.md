# Spec 04 — Registro de Vendas

**Referência:** [PRD](../prd/PRD.md) seções 3.4, 3.5 e 4.3, 4.4

## Objetivo

Permitir registrar vendas vinculadas a clientes e produtos, com atualização automática de estoque e visão resumida no dashboard.

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF-01 | Criar venda selecionando um cliente |
| RF-02 | Adicionar um ou mais produtos com quantidade |
| RF-03 | Calcular valor total automaticamente (preço × quantidade) |
| RF-04 | Impedir venda se estoque insuficiente |
| RF-05 | Baixar estoque ao confirmar venda |
| RF-06 | Listar vendas com data, cliente e valor total |
| RF-07 | Visualizar detalhes de venda (itens, quantidades, valores) |
| RF-08 | Dashboard exibe total de vendas do dia |
| RF-09 | Dashboard exibe total de vendas do mês |
| RF-10 | Dashboard exibe contagem de clientes e produtos |

## Modelo de dados (conceitual)

**Venda:**

| Campo | Descrição |
|-------|-----------|
| Cliente | Referência ao cliente |
| Data | Data/hora da venda |
| Valor total | Soma dos itens |
| Itens | Lista de produto + quantidade + subtotal |

## Casos de uso

### UC-01: Registrar venda

1. Usuário inicia nova venda
2. Seleciona cliente
3. Adiciona produtos e quantidades
4. Sistema calcula total e valida estoque
5. Usuário confirma → venda salva, estoque atualizado

**Fluxo alternativo — estoque insuficiente:**

1. Sistema exibe erro indicando produto e quantidade disponível
2. Usuário ajusta quantidade ou cancela

### UC-02: Consultar dashboard

1. Usuário autenticado acessa painel
2. Sistema exibe: vendas do dia, vendas do mês, total de clientes, total de produtos

## Critérios de aceite

- [ ] Venda exige cliente e pelo menos um item
- [ ] Total calculado corretamente
- [ ] Estoque decrementado após confirmação
- [ ] Venda bloqueada se estoque insuficiente
- [ ] Listagem ordenada por data (mais recente primeiro)
- [ ] Dashboard atualiza após nova venda
- [ ] Totais do dia consideram apenas vendas da data atual
- [ ] Totais do mês consideram vendas do mês corrente

## Fora do escopo

- Desconto em vendas
- Múltiplas formas de pagamento
- Cancelamento/estorno de venda
