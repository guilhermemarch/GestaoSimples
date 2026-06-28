# Documento de Design e UX — GestãoSimples

Proposta visual, telas, padrões estéticos e experiência do usuário.

**Produto:** GestãoSimples
**Objetivo do design:** criar uma interface simples, confiável, moderna e rápida para pequenos empresários e operadores que precisam usar o sistema durante o expediente, sem treinamento complexo.

---

## 1. Direção de design

O GestãoSimples deve parecer:

* simples, mas não amador;
* moderno, mas não complexo;
* confiável, mas não frio;
* organizado, mas não burocrático;
* rápido, claro e direto.

A experiência deve lembrar uma ferramenta de trabalho diária, como um caixa, painel de controle ou agenda operacional. O usuário deve sentir que consegue entender o sistema em poucos minutos.

---

## 2. Princípios de UX

### 2.1 Clareza acima de tudo

Cada tela deve ter uma ação principal evidente. O usuário não deve precisar pensar muito para entender o próximo passo.

Exemplo:

* Na tela de vendas, o botão principal é “Confirmar venda”.
* Na tela de produtos, o botão principal é “Novo produto”.
* No caixa, o botão principal muda conforme o estado: “Abrir caixa” ou “Fechar caixa”.

### 2.2 Poucos cliques

As ações recorrentes devem estar sempre acessíveis:

* nova venda;
* buscar cliente;
* buscar produto;
* ver estoque baixo;
* fechar caixa.

### 2.3 Linguagem simples

Evitar termos técnicos como “entidade”, “transação”, “conciliar”, “inventário fiscal”.

Preferir:

* “Venda”;
* “Produto”;
* “Dinheiro recebido”;
* “Conta pendente”;
* “Estoque baixo”;
* “Fechar caixa”.

### 2.4 Feedback imediato

Toda ação importante deve dar retorno visual:

* venda registrada;
* produto salvo;
* estoque atualizado;
* caixa fechado;
* erro de estoque insuficiente;
* cliente com pendência.

### 2.5 Confiança operacional

O sistema deve deixar claro quando algo afeta dinheiro ou estoque.

Exemplo:

Antes de cancelar uma venda, exibir:

“Cancelar esta venda vai devolver os produtos ao estoque. Deseja continuar?”

---

## 3. Identidade visual

## 3.1 Personalidade da marca

O GestãoSimples deve transmitir:

* organização;
* confiança;
* proximidade;
* praticidade;
* controle;
* leveza.

Não deve parecer:

* sistema corporativo antigo;
* planilha disfarçada;
* aplicativo financeiro complicado;
* ferramenta genérica sem personalidade.

---

## 3.2 Paleta de cores

### Cor primária

**Verde gestão**

* Hex: `#1F8A5B`
* Uso: botões principais, links importantes, ícones ativos, destaques positivos.
* Sensação: controle, crescimento, segurança.

### Cor primária escura

**Verde profundo**

* Hex: `#146C46`
* Uso: hover de botões, sidebar ativa, cabeçalhos importantes.

### Cor secundária

**Azul confiança**

* Hex: `#2563EB`
* Uso: informações, atalhos, gráficos, elementos de suporte.

### Cor de fundo

**Cinza claro quente**

* Hex: `#F6F7F4`
* Uso: fundo geral do sistema.

### Cor de superfície

**Branco**

* Hex: `#FFFFFF`
* Uso: cards, modais, tabelas, formulários.

### Cor de texto principal

**Grafite**

* Hex: `#1F2933`
* Uso: títulos e textos principais.

### Cor de texto secundário

**Cinza médio**

* Hex: `#667085`
* Uso: descrições, labels, metadados.

### Cor de alerta

**Laranja atenção**

* Hex: `#F59E0B`
* Uso: estoque baixo, caixa com diferença, orçamento vencendo.

### Cor de erro

**Vermelho controle**

* Hex: `#DC2626`
* Uso: venda cancelada, conta vencida, erro crítico.

### Cor de sucesso

**Verde sucesso**

* Hex: `#16A34A`
* Uso: confirmação, pagamento recebido, caixa fechado com sucesso.

---

## 4. Tipografia

### Fonte recomendada

**Inter** ou **Roboto**

Motivo:

* boa leitura em telas pequenas;
* aparência moderna;
* ótima legibilidade em tabelas e números;
* familiar para sistemas web.

### Hierarquia

#### Título de página

* Peso: 700
* Tamanho: 24px a 28px
* Exemplo: “Dashboard”, “Nova venda”, “Produtos”

#### Subtítulo ou seção

* Peso: 600
* Tamanho: 18px a 20px

#### Texto comum

* Peso: 400
* Tamanho: 14px a 16px

#### Texto auxiliar

* Peso: 400
* Tamanho: 12px a 13px
* Cor: cinza médio

#### Números de dashboard

* Peso: 700
* Tamanho: 28px a 36px

---

## 5. Layout geral

## 5.1 Estrutura desktop

A interface principal deve usar:

* sidebar lateral fixa;
* topo com nome da tela, busca e usuário;
* área central com cards, tabelas e formulários;
* botão de ação principal sempre visível.

### Sidebar

Itens sugeridos:

1. Dashboard
2. Nova venda
3. Clientes
4. Produtos
5. Estoque
6. Caixa
7. Financeiro
8. Serviços
9. Relatórios
10. Configurações

### Topbar

Elementos:

* título da página;
* campo de busca global;
* atalho para notificações;
* nome do usuário;
* status do caixa.

Exemplo de status:

* “Caixa aberto”
* “Caixa fechado”
* “3 alertas”

---

## 5.2 Estrutura mobile

No celular, a navegação deve priorizar ações rápidas.

### Navegação inferior

Itens principais:

1. Início
2. Venda
3. Produtos
4. Clientes
5. Mais

A tela de venda deve ser otimizada para uso com uma mão, com botões grandes e busca rápida.

---

## 6. Componentes visuais

## 6.1 Botões

### Botão primário

Uso:

* confirmar venda;
* salvar cadastro;
* abrir caixa;
* fechar caixa;
* registrar pagamento.

Estilo:

* fundo verde;
* texto branco;
* borda arredondada de 8px;
* altura mínima de 40px.

Exemplo:

“Confirmar venda”

### Botão secundário

Uso:

* cancelar;
* voltar;
* limpar filtros;
* visualizar detalhes.

Estilo:

* fundo branco;
* borda cinza;
* texto grafite.

### Botão destrutivo

Uso:

* cancelar venda;
* excluir;
* inativar.

Estilo:

* fundo vermelho ou texto vermelho;
* sempre acompanhado de confirmação.

---

## 6.2 Cards

Cards devem ser usados para:

* indicadores do dashboard;
* alertas;
* resumos de venda;
* resumo do caixa;
* totais financeiros.

Estrutura:

* título curto;
* valor em destaque;
* variação ou descrição;
* ícone simples.

Exemplo:

**Vendas hoje**
R$ 1.250,00
18 vendas realizadas

---

## 6.3 Tabelas

Tabelas devem ser simples, com ações claras.

### Padrão visual

* cabeçalho leve;
* linhas com espaçamento confortável;
* status em badges;
* ações no lado direito;
* filtros acima da tabela.

### Exemplo de colunas para produtos

* Produto
* Categoria
* Estoque
* Preço
* Status
* Ações

### Exemplo de colunas para vendas

* Data
* Cliente
* Valor
* Pagamento
* Status
* Ações

---

## 6.4 Badges

Usar badges para estados importantes.

### Exemplos

* Pago: verde
* Pendente: laranja
* Vencido: vermelho
* Em estoque: verde
* Estoque baixo: laranja
* Sem estoque: vermelho
* Ativo: verde
* Inativo: cinza

---

## 6.5 Formulários

Formulários devem ser divididos em blocos lógicos.

Exemplo em produto:

1. Dados básicos
2. Preços
3. Estoque
4. Fornecedor
5. Observações

### Regras visuais

* Labels sempre visíveis.
* Campos obrigatórios marcados com asterisco.
* Mensagens de erro abaixo do campo.
* Botão principal no final do formulário.
* Em telas longas, botão “Salvar” fixo no rodapé.

---

## 6.6 Modais

Usar modais para confirmações e ações curtas.

Exemplos:

* cancelar venda;
* registrar pagamento;
* ajustar estoque;
* confirmar fechamento de caixa;
* excluir cadastro.

Modais não devem ser usados para cadastros muito longos.

---

## 7. Telas principais

## 7.1 Tela de login

### Objetivo

Permitir acesso rápido e seguro.

### Elementos

* logo GestãoSimples;
* campo e-mail;
* campo senha;
* botão “Entrar”;
* link “Esqueci minha senha”;
* mensagem de erro clara.

### Estética

Tela limpa, centralizada, com fundo claro e card branco.

### Microcopy

“Entre para gerenciar suas vendas, estoque e caixa.”

---

## 7.2 Tela de onboarding inicial

### Objetivo

Configurar a empresa no primeiro acesso.

### Etapas

1. Dados da empresa
2. Segmento do negócio
3. Cadastro inicial de produtos
4. Convite de usuários
5. Abrir dashboard

### Abordagem

O onboarding deve ser curto. O usuário pode pular etapas e completar depois.

### Exemplo de pergunta

“Qual tipo de negócio você gerencia?”

Opções:

* Loja ou comércio
* Serviços
* Oficina ou assistência
* Alimentação
* Outro

---

## 7.3 Dashboard

### Objetivo

Mostrar rapidamente a situação do negócio.

### Blocos

#### Linha 1 — Indicadores principais

* Vendas hoje
* Recebido hoje
* Pendente
* Ticket médio

#### Linha 2 — Alertas

* Produtos com estoque baixo
* Contas vencidas
* Caixa aberto ou fechado
* Orçamentos vencendo

#### Linha 3 — Gráficos simples

* Vendas dos últimos 7 dias
* Formas de pagamento
* Produtos mais vendidos

#### Ações rápidas

* Nova venda
* Novo cliente
* Novo produto
* Fechar caixa
* Registrar despesa

### Estética

Cards grandes, números claros e poucos gráficos. O dashboard deve ser mais operacional do que analítico.

---

## 7.4 Tela de nova venda

### Objetivo

Registrar venda com o mínimo de atrito.

### Layout desktop

Divisão em duas colunas:

#### Coluna esquerda

* busca de produto;
* lista de produtos encontrados;
* categorias rápidas;
* leitor/campo de código de barras.

#### Coluna direita

* cliente selecionado;
* itens da venda;
* subtotal;
* desconto;
* total;
* forma de pagamento;
* botão “Confirmar venda”.

### Estados importantes

* produto sem estoque;
* cliente com pendência;
* desconto acima do limite;
* venda confirmada;
* venda pendente;
* erro de caixa fechado.

### Botões principais

* Adicionar produto
* Aplicar desconto
* Confirmar venda
* Salvar como orçamento

---

## 7.5 Tela de clientes

### Objetivo

Gerenciar clientes e histórico.

### Elementos

* busca por nome, telefone ou documento;
* botão “Novo cliente”;
* filtros por etiqueta;
* tabela de clientes;
* indicação de pendência financeira;
* data da última compra.

### Detalhe do cliente

A página de detalhe deve mostrar:

* dados cadastrais;
* histórico de vendas;
* contas pendentes;
* observações;
* etiquetas;
* total comprado;
* última compra.

### Ações rápidas

* Nova venda para este cliente
* Registrar pagamento
* Editar cliente
* Adicionar observação

---

## 7.6 Tela de produtos

### Objetivo

Controlar cadastro e estoque.

### Elementos

* busca por nome, SKU ou código de barras;
* filtro por categoria;
* filtro de estoque baixo;
* botão “Novo produto”;
* tabela de produtos.

### Destaques

Produtos com estoque baixo devem aparecer com badge laranja.

Produtos sem estoque devem aparecer com badge vermelho.

### Detalhe do produto

Mostrar:

* dados do produto;
* preço de custo;
* preço de venda;
* margem estimada;
* estoque atual;
* estoque mínimo;
* fornecedor;
* histórico de movimentações;
* vendas recentes.

### Ações rápidas

* Ajustar estoque
* Registrar entrada
* Editar produto
* Inativar produto

---

## 7.7 Tela de estoque

### Objetivo

Dar visão operacional sobre produtos disponíveis.

### Abas

1. Estoque atual
2. Estoque baixo
3. Movimentações
4. Entradas
5. Ajustes

### Recursos

* lista de produtos abaixo do mínimo;
* botão “Registrar compra”;
* botão “Ajustar estoque”;
* histórico de entradas e saídas;
* motivo obrigatório para ajuste manual.

---

## 7.8 Tela de caixa

### Objetivo

Controlar abertura, movimentações e fechamento diário.

### Estado: caixa fechado

Mostrar:

* mensagem “O caixa ainda não foi aberto hoje”;
* campo para valor inicial;
* botão “Abrir caixa”.

### Estado: caixa aberto

Mostrar:

* horário de abertura;
* responsável;
* valor inicial;
* vendas em dinheiro;
* vendas em Pix;
* vendas em cartão;
* sangrias;
* reforços;
* despesas;
* valor esperado;
* botão “Fechar caixa”.

### Fechamento

Tela ou modal com:

* valor esperado por forma de pagamento;
* valor contado;
* diferença;
* justificativa, se houver;
* confirmação final.

---

## 7.9 Tela financeiro

### Objetivo

Controlar dinheiro a receber e despesas.

### Abas

1. Contas a receber
2. Despesas
3. Resultado do mês

### Contas a receber

Mostrar:

* cliente;
* valor;
* vencimento;
* status;
* ações.

Ações:

* registrar pagamento;
* copiar mensagem de cobrança;
* ver cliente.

### Despesas

Mostrar:

* descrição;
* categoria;
* valor;
* vencimento;
* status;
* ação para marcar como paga.

### Resultado do mês

Mostrar:

* total vendido;
* total recebido;
* total pendente;
* despesas pagas;
* resultado estimado.

---

## 7.10 Tela de serviços

### Objetivo

Gerenciar atendimentos e ordens de serviço.

### Layout

Lista em formato kanban ou tabela.

Status sugeridos:

* Orçamento
* Aprovado
* Em andamento
* Aguardando peça
* Concluído
* Entregue
* Cancelado

### Detalhe da ordem

Mostrar:

* cliente;
* descrição;
* status;
* prazo;
* produtos usados;
* mão de obra;
* total;
* observações;
* histórico de alterações.

---

## 7.11 Tela de relatórios

### Objetivo

Fornecer informações simples para decisão.

### Relatórios visuais

* vendas por período;
* vendas por produto;
* vendas por cliente;
* estoque baixo;
* contas vencidas;
* despesas por categoria.

### Padrão

Relatórios devem ter:

* filtro de data;
* cards de resumo;
* gráfico simples;
* tabela detalhada;
* botão exportar.

---

## 8. Padrões de interação

## 8.1 Busca global

A busca global deve permitir procurar:

* clientes;
* produtos;
* vendas;
* ordens de serviço.

Exemplo:

Usuário digita “Maria” e vê:

* cliente Maria Oliveira;
* vendas recentes da Maria;
* contas pendentes da Maria.

---

## 8.2 Estados vazios

Estados vazios devem orientar o usuário.

### Exemplo: sem produtos cadastrados

“Você ainda não cadastrou produtos.”

Texto auxiliar:

“Cadastre seus produtos para começar a vender e controlar estoque.”

Botão:

“Cadastrar primeiro produto”

---

## 8.3 Mensagens de sucesso

Mensagens devem ser curtas e objetivas.

Exemplos:

* “Venda registrada com sucesso.”
* “Produto salvo.”
* “Estoque atualizado.”
* “Pagamento registrado.”
* “Caixa fechado com sucesso.”

---

## 8.4 Mensagens de erro

Erros devem explicar o problema e a solução.

Exemplo ruim:

“Erro 422.”

Exemplo bom:

“Não há estoque suficiente para este produto. Estoque atual: 2 unidades.”

---

## 8.5 Confirmações críticas

Ações críticas exigem confirmação:

* cancelar venda;
* fechar caixa;
* excluir usuário;
* inativar produto;
* ajustar estoque;
* cancelar ordem de serviço.

---

## 9. Padrões estéticos

## 9.1 Bordas

* Cards: 12px
* Botões: 8px
* Inputs: 8px
* Modais: 16px

## 9.2 Sombras

Usar sombras suaves, apenas para separar camadas.

Exemplo:

* cards com sombra leve;
* modal com sombra média;
* evitar sombras fortes ou pesadas.

## 9.3 Espaçamento

Base de espaçamento: 8px.

Escala:

* 4px
* 8px
* 12px
* 16px
* 24px
* 32px
* 48px

## 9.4 Ícones

Usar ícones simples, lineares e fáceis de reconhecer.

Exemplos:

* carrinho para venda;
* caixa registradora para caixa;
* usuário para clientes;
* pacote para produtos;
* alerta para pendências;
* gráfico para relatórios.

---

## 10. Tom de voz

O sistema deve falar como um assistente de gestão simples, não como um software corporativo.

### Exemplos

Em vez de:

“Transação processada com êxito.”

Usar:

“Venda registrada com sucesso.”

Em vez de:

“Entidade não encontrada.”

Usar:

“Não encontramos esse cliente.”

Em vez de:

“Saldo inconsistente.”

Usar:

“O valor contado não bate com o valor esperado.”

---

## 11. Acessibilidade

O design deve considerar:

* contraste adequado entre texto e fundo;
* botões com tamanho confortável;
* labels visíveis;
* mensagens de erro claras;
* navegação por teclado em telas principais;
* não depender apenas de cor para indicar status;
* ícones acompanhados de texto quando possível.

---

## 12. Componentes principais do design system

### Componentes obrigatórios

* Button
* Input
* Select
* Textarea
* Checkbox
* Badge
* Card
* Table
* Modal
* Toast
* Tabs
* Sidebar
* Topbar
* Empty State
* Alert
* Date Filter
* Money Input
* Quantity Input
* Search Bar
* User Menu
* Status Indicator

---

## 13. Exemplo de arquitetura visual

### Página padrão

1. Sidebar fixa à esquerda.
2. Topbar superior.
3. Título da página.
4. Descrição curta.
5. Ação principal no canto superior direito.
6. Filtros ou busca.
7. Conteúdo principal em cards ou tabela.
8. Feedback visual para estados vazios, erro ou carregamento.

### Exemplo: Produtos

Título:

“Produtos”

Descrição:

“Cadastre produtos, acompanhe preços e controle estoque.”

Ação principal:

“Novo produto”

Filtros:

* busca;
* categoria;
* status;
* estoque baixo.

Conteúdo:

Tabela de produtos com badges e ações.

---

## 14. Experiência ideal por tipo de usuário

### Administrador

Deve enxergar:

* visão financeira;
* alertas;
* relatórios;
* usuários;
* configurações.

### Gerente

Deve operar:

* vendas;
* estoque;
* caixa;
* clientes;
* relatórios operacionais.

### Operador

Deve focar em:

* nova venda;
* consulta de cliente;
* consulta de produto;
* registro de serviço;
* recebimento simples.

A interface do operador deve esconder o que não é necessário.

---

## 15. Direção para protótipo

O protótipo inicial deve incluir as seguintes telas:

1. Login
2. Onboarding da empresa
3. Dashboard
4. Nova venda
5. Clientes
6. Detalhe do cliente
7. Produtos
8. Detalhe do produto
9. Estoque baixo
10. Caixa aberto
11. Fechamento de caixa
12. Financeiro
13. Contas a receber
14. Despesas
15. Serviços
16. Relatórios
17. Configurações

---

## 16. Resumo visual

O GestãoSimples deve ter uma aparência limpa, com muito uso de branco, verde como cor principal, cinzas suaves, cards organizados e botões bem evidentes.

A interface deve transmitir a sensação de:

“Eu sei o que está acontecendo no meu negócio.”

E não:

“Estou preso em um sistema complicado.”
