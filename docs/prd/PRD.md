# PRD — GestãoSimples

Sistema de gestão operacional e financeira para micro e pequenas empresas.

**Versão:** 2.0
**Produto:** GestãoSimples
**Tipo:** SaaS web responsivo
**Público:** pequenos negócios, comércios locais e prestadores de serviço
**Objetivo do MVP:** substituir planilhas e controles manuais por um sistema simples, rápido e confiável para vendas, clientes, estoque, caixa e visão financeira básica.

---

## 1. Visão geral do produto

O **GestãoSimples** é um sistema de gestão pensado para pequenos negócios que precisam controlar vendas, clientes, estoque, caixa e finanças sem depender de planilhas, cadernos ou softwares corporativos complexos.

A proposta não é ser um ERP completo. A proposta é ser uma ferramenta prática para o dia a dia do dono do negócio: registrar vendas rapidamente, saber o que tem em estoque, acompanhar dinheiro entrando e saindo, identificar clientes em débito e tomar decisões simples com base em dados reais.

---

## 2. Problema

Pequenos negócios normalmente operam com controles fragmentados:

* vendas anotadas em caderno;
* estoque controlado “de cabeça”;
* clientes registrados em WhatsApp ou agenda;
* contas a receber esquecidas;
* fechamento de caixa feito manualmente;
* decisões tomadas sem dados claros.

Isso gera problemas diretos:

### 2.1 Erros operacionais

Vendas podem ser esquecidas, registradas com valor errado ou sem baixa no estoque.

### 2.2 Perda financeira

O dono não sabe exatamente quanto vendeu, quanto recebeu, quanto ficou pendente e quanto gastou no dia.

### 2.3 Falta de controle de estoque

Produtos acabam sem aviso, produtos parados não são percebidos e compras são feitas sem planejamento.

### 2.4 Baixa profissionalização

O atendimento ao cliente fica desorganizado, sem histórico de compras, pendências ou preferências.

### 2.5 Dependência do dono

Como as informações ficam na cabeça do proprietário, a operação não escala e os funcionários não conseguem trabalhar com autonomia.

---

## 3. Objetivo do produto

Criar uma plataforma simples, centralizada e acessível para que pequenos negócios possam:

* registrar vendas com rapidez;
* controlar estoque automaticamente;
* gerenciar clientes e histórico de relacionamento;
* acompanhar caixa, recebimentos e despesas;
* visualizar indicadores do negócio;
* reduzir retrabalho e erros manuais;
* profissionalizar a rotina sem aumentar a complexidade.

---

## 4. Público-alvo

### 4.1 Usuários principais

#### Dono de micro ou pequena empresa

Pessoa responsável por vendas, compras, atendimento, financeiro e decisões do negócio.

Necessidades principais:

* saber quanto vendeu;
* saber se o caixa bate;
* acompanhar estoque;
* controlar dívidas de clientes;
* saber o que precisa comprar;
* ter uma visão simples do desempenho do negócio.

#### Funcionário operacional

Pessoa que realiza vendas, atende clientes, consulta produtos e registra movimentações.

Necessidades principais:

* registrar venda rápido;
* consultar preço e estoque;
* localizar cliente;
* não acessar informações sensíveis do negócio;
* usar o sistema com pouco treinamento.

#### Prestador de serviço

Profissional autônomo ou pequena equipe que realiza serviços, orçamentos e atendimentos.

Necessidades principais:

* cadastrar clientes;
* registrar serviços;
* controlar status de atendimento;
* registrar peças, materiais ou produtos utilizados;
* acompanhar pagamentos pendentes.

---

## 5. Personas

### 5.1 Persona 1 — João, dono de papelaria

João tem uma papelaria de bairro com dois funcionários. Hoje controla vendas em planilha e estoque visualmente. Frequentemente compra produtos que ainda tem em estoque e esquece de repor produtos que vendem mais.

**Objetivo:** saber o faturamento diário, controlar estoque e identificar produtos mais vendidos.

### 5.2 Persona 2 — Carla, dona de salão de beleza

Carla atende clientes recorrentes, vende alguns produtos e permite pagamento posterior para clientes conhecidos. Ela anota pendências em um caderno.

**Objetivo:** controlar clientes, serviços realizados, produtos vendidos e pagamentos pendentes.

### 5.3 Persona 3 — Marcos, oficina mecânica

Marcos faz orçamentos, vende peças e presta serviços. Muitas vezes não sabe exatamente quanto ganhou em cada serviço porque mistura mão de obra, peças e despesas.

**Objetivo:** registrar ordens de serviço, controlar peças usadas, status do serviço e valor final cobrado.

---

## 6. Proposta de valor

O GestãoSimples entrega:

* controle de vendas sem complicação;
* estoque atualizado automaticamente;
* visão clara do dinheiro do dia;
* clientes organizados com histórico;
* alertas de estoque baixo e pagamentos pendentes;
* fechamento de caixa simples;
* relatórios úteis para decisão;
* interface fácil para quem não tem familiaridade com sistemas complexos.

---

## 7. Escopo funcional

## 7.1 Autenticação, empresa e usuários

### Funcionalidades

* Login com e-mail e senha.
* Logout seguro.
* Recuperação de senha.
* Cadastro inicial da empresa.
* Configuração de nome fantasia, CNPJ/CPF, telefone, endereço e segmento.
* Perfis de acesso:

  * administrador;
  * gerente;
  * operador.
* Controle de permissões por perfil.
* Histórico básico de ações importantes.

### Regras de negócio

* Apenas administradores podem cadastrar ou remover usuários.
* Operadores não podem visualizar lucro, despesas ou relatórios financeiros sensíveis.
* O sistema deve impedir acesso a dados de uma empresa por usuários de outra empresa.
* Toda venda cancelada deve registrar usuário, data e motivo.

---

## 7.2 Dashboard principal

### Funcionalidades

O dashboard deve apresentar uma visão rápida do negócio.

Indicadores principais:

* vendas do dia;
* vendas do mês;
* valor recebido hoje;
* valor pendente;
* quantidade de vendas realizadas;
* ticket médio;
* produtos com estoque baixo;
* clientes com pagamento em atraso;
* despesas do mês;
* saldo estimado do caixa;
* produtos mais vendidos;
* formas de pagamento mais usadas.

### Diferencial prático

O painel não deve ser apenas informativo. Ele deve gerar ações rápidas:

* “Registrar nova venda”;
* “Cadastrar cliente”;
* “Ver estoque baixo”;
* “Fechar caixa”;
* “Cobrar pendências”;
* “Cadastrar despesa”.

---

## 7.3 Cadastro de clientes

### Funcionalidades

* Cadastrar cliente com:

  * nome;
  * telefone;
  * e-mail;
  * CPF/CNPJ opcional;
  * endereço;
  * observações;
  * categoria ou etiqueta.
* Editar cliente.
* Excluir cliente sem vínculos críticos.
* Inativar cliente com histórico.
* Buscar por nome, telefone ou documento.
* Visualizar histórico de compras.
* Visualizar pagamentos pendentes.
* Registrar observações internas.
* Adicionar etiquetas, como:

  * cliente VIP;
  * paga depois;
  * fornecedor;
  * inadimplente;
  * recorrente.
* Ver data da última compra.
* Ver total comprado pelo cliente.

### Regras de negócio

* Clientes com vendas registradas não devem ser excluídos, apenas inativados.
* O sistema deve permitir venda sem cliente identificado, usando “Cliente avulso”.
* O telefone deve ser validado em formato básico.
* Clientes inadimplentes devem aparecer com alerta no momento da venda.

---

## 7.4 Cadastro de produtos

### Funcionalidades

* Cadastrar produto com:

  * nome;
  * código interno ou SKU;
  * código de barras opcional;
  * categoria;
  * preço de venda;
  * preço de custo;
  * margem estimada;
  * quantidade em estoque;
  * estoque mínimo;
  * unidade de medida;
  * fornecedor;
  * status ativo/inativo;
  * foto opcional.
* Editar produto.
* Inativar produto.
* Buscar produto por nome, código, categoria ou código de barras.
* Visualizar estoque atual.
* Visualizar histórico de movimentação.
* Identificar produtos com estoque baixo.
* Identificar produtos parados.
* Ajustar estoque manualmente com motivo.
* Registrar entrada de estoque por compra.
* Registrar saída por perda, vencimento, uso interno ou ajuste.

### Regras de negócio

* Produto com venda vinculada não pode ser excluído, apenas inativado.
* Estoque não pode ficar negativo, exceto se a empresa ativar permissão específica.
* Todo ajuste manual de estoque deve exigir motivo.
* Preço de venda não pode ser negativo.
* Produto abaixo do estoque mínimo deve gerar alerta.

---

## 7.5 Fornecedores e compras

### Funcionalidades

* Cadastrar fornecedor com:

  * nome;
  * telefone;
  * e-mail;
  * CNPJ opcional;
  * endereço;
  * observações.
* Vincular produtos a fornecedores.
* Registrar compra de produtos.
* Atualizar estoque a partir de uma compra.
* Registrar custo unitário da compra.
* Consultar histórico de compras por fornecedor.
* Ver produtos comprados recentemente.
* Ver sugestão de reposição baseada em estoque mínimo.

### Regras de negócio

* Uma compra confirmada deve gerar entrada de estoque.
* Uma compra cancelada deve reverter movimentações, quando possível.
* Alterações em compras confirmadas devem ficar registradas no histórico.

---

## 7.6 Registro de vendas

### Funcionalidades

* Criar venda rápida.
* Selecionar cliente ou usar cliente avulso.
* Adicionar produtos por busca, categoria ou código de barras.
* Definir quantidade.
* Aplicar desconto por item ou na venda total.
* Calcular total automaticamente.
* Selecionar forma de pagamento:

  * dinheiro;
  * Pix;
  * cartão de débito;
  * cartão de crédito;
  * fiado/pendente;
  * múltiplas formas.
* Registrar valor recebido e troco.
* Confirmar venda.
* Atualizar estoque automaticamente.
* Gerar comprovante simples.
* Enviar comprovante por WhatsApp ou copiar resumo da venda.
* Cancelar venda com motivo.
* Consultar detalhes da venda.
* Listar vendas por período, cliente, forma de pagamento ou usuário.

### Regras de negócio

* Venda confirmada deve gerar baixa de estoque.
* Venda cancelada deve devolver estoque, se aplicável.
* Desconto não pode ultrapassar limite definido pelo administrador.
* Operador pode registrar venda, mas não pode excluir venda.
* Venda fiada deve gerar conta a receber.
* O sistema deve avisar quando o cliente tiver pendências em aberto.

---

## 7.7 Caixa e fechamento diário

### Funcionalidades

* Abrir caixa no início do expediente.
* Informar valor inicial.
* Registrar vendas vinculadas ao caixa aberto.
* Registrar reforço de caixa.
* Registrar sangria.
* Registrar despesas pagas no caixa.
* Fechar caixa.
* Comparar:

  * valor esperado;
  * valor informado;
  * diferença.
* Separar valores por forma de pagamento.
* Gerar resumo do fechamento.
* Histórico de caixas anteriores.

### Regras de negócio

* Não deve ser possível registrar venda em dinheiro sem caixa aberto, quando a configuração de caixa estiver ativa.
* Fechamento com diferença deve exigir justificativa.
* Caixa fechado não deve aceitar novas movimentações.
* Apenas administrador ou gerente pode reabrir caixa.

---

## 7.8 Contas a receber

### Funcionalidades

* Gerar conta a receber automaticamente em vendas pendentes.
* Cadastrar cobrança manual.
* Definir data de vencimento.
* Registrar pagamento parcial ou total.
* Visualizar contas:

  * em aberto;
  * vencidas;
  * pagas;
  * parcialmente pagas.
* Filtrar por cliente, vencimento ou valor.
* Enviar lembrete manual por WhatsApp.
* Ver histórico financeiro do cliente.

### Regras de negócio

* Conta vencida deve aparecer em destaque.
* Cliente com pendência deve exibir alerta no cadastro e na tela de venda.
* Pagamento total deve alterar status para pago.
* Pagamento parcial deve manter saldo restante.

---

## 7.9 Despesas e contas a pagar

### Funcionalidades

* Cadastrar despesa com:

  * descrição;
  * categoria;
  * valor;
  * data;
  * forma de pagamento;
  * status pago ou pendente;
  * fornecedor opcional.
* Categorias sugeridas:

  * aluguel;
  * energia;
  * internet;
  * salário;
  * fornecedor;
  * manutenção;
  * imposto;
  * outros.
* Listar despesas por período.
* Visualizar despesas vencidas.
* Marcar despesa como paga.
* Exibir impacto das despesas no resultado mensal.

### Regras de negócio

* Despesa paga deve entrar no resumo financeiro.
* Despesa vencida deve gerar alerta.
* Operador não deve acessar despesas, salvo permissão específica.

---

## 7.10 Serviços e ordens de serviço

Este módulo atende negócios como oficinas, assistências técnicas, salões, manutenção e prestadores de serviço.

### Funcionalidades

* Criar ordem de serviço.
* Vincular cliente.
* Descrever problema, solicitação ou serviço.
* Definir status:

  * orçamento;
  * aprovado;
  * em andamento;
  * aguardando peça;
  * concluído;
  * entregue;
  * cancelado.
* Adicionar produtos ou peças utilizadas.
* Adicionar valor de mão de obra.
* Gerar valor total.
* Registrar prazo estimado.
* Registrar observações internas.
* Converter ordem de serviço em venda.
* Consultar histórico de serviços por cliente.

### Regras de negócio

* Produtos utilizados em serviço devem baixar estoque ao confirmar a venda ou conclusão.
* Ordem cancelada não deve gerar cobrança, salvo se houver taxa registrada.
* Alterações de status devem ficar registradas no histórico.

---

## 7.11 Orçamentos

### Funcionalidades

* Criar orçamento para cliente.
* Adicionar produtos e serviços.
* Aplicar descontos.
* Definir validade do orçamento.
* Marcar status:

  * rascunho;
  * enviado;
  * aprovado;
  * recusado;
  * expirado.
* Converter orçamento aprovado em venda.
* Copiar resumo do orçamento para envio por WhatsApp.

### Regras de negócio

* Orçamento não deve baixar estoque antes de virar venda.
* Orçamento expirado deve ser sinalizado.
* Conversão para venda deve reaproveitar itens e valores do orçamento.

---

## 7.12 Relatórios

### Funcionalidades

Relatórios simples, práticos e focados em decisão.

Relatórios essenciais:

* vendas por período;
* vendas por forma de pagamento;
* vendas por produto;
* produtos mais vendidos;
* produtos com estoque baixo;
* clientes que mais compram;
* contas a receber em atraso;
* despesas por categoria;
* resultado mensal estimado;
* movimentações de estoque.

### Regras de negócio

* Administrador tem acesso total aos relatórios.
* Gerente pode acessar relatórios operacionais.
* Operador não deve acessar relatórios financeiros sensíveis.
* Relatórios devem ter filtros simples por data.

---

## 7.13 Notificações e alertas

### Funcionalidades

* Alerta de estoque baixo.
* Alerta de contas vencidas.
* Alerta de caixa ainda aberto.
* Alerta de venda com estoque insuficiente.
* Alerta de cliente inadimplente.
* Alerta de orçamento vencendo.
* Alerta de despesas próximas do vencimento.

### Canais no MVP

* Notificações dentro do sistema.
* Destaques visuais no dashboard.
* Mensagens copiáveis para WhatsApp.

Integração automática com WhatsApp fica fora do MVP.

---

## 7.14 Importação e exportação

### Funcionalidades

* Importar clientes via planilha CSV.
* Importar produtos via planilha CSV.
* Exportar listagem de clientes.
* Exportar produtos.
* Exportar vendas por período.
* Exportar contas a receber.

### Regras de negócio

* Importação deve validar campos obrigatórios.
* Importação com erro deve indicar linha e motivo.
* Exportação financeira deve respeitar permissões de usuário.

---

## 8. Fluxos principais

## 8.1 Fluxo de login

1. Usuário acessa a tela inicial.
2. Informa e-mail e senha.
3. Sistema valida credenciais.
4. Se válido, direciona ao dashboard.
5. Se inválido, exibe erro claro.
6. Após múltiplas tentativas, sistema pode bloquear temporariamente o acesso.

---

## 8.2 Fluxo de abertura de caixa

1. Usuário acessa módulo de caixa.
2. Seleciona “Abrir caixa”.
3. Informa valor inicial.
4. Sistema registra data, hora e usuário.
5. Caixa fica disponível para vendas.
6. Dashboard passa a indicar caixa aberto.

---

## 8.3 Fluxo de venda rápida

1. Usuário acessa “Nova venda”.
2. Seleciona cliente ou mantém cliente avulso.
3. Busca produto pelo nome, código ou categoria.
4. Informa quantidade.
5. Sistema valida estoque.
6. Sistema calcula total.
7. Usuário define pagamento.
8. Sistema calcula troco, se necessário.
9. Usuário confirma venda.
10. Sistema baixa estoque.
11. Sistema registra pagamento.
12. Sistema exibe comprovante simples.

---

## 8.4 Fluxo de venda fiada

1. Usuário inicia nova venda.
2. Seleciona cliente cadastrado.
3. Adiciona produtos.
4. Seleciona pagamento “pendente”.
5. Define data de vencimento.
6. Sistema confirma venda.
7. Sistema baixa estoque.
8. Sistema cria conta a receber.
9. Cliente passa a aparecer na lista de pendências.

---

## 8.5 Fluxo de fechamento de caixa

1. Usuário acessa caixa aberto.
2. Sistema mostra resumo de vendas e movimentações.
3. Usuário informa valores contados por forma de pagamento.
4. Sistema compara valor esperado e valor informado.
5. Se houver diferença, usuário informa justificativa.
6. Sistema fecha caixa.
7. Sistema gera resumo do dia.

---

## 8.6 Fluxo de reposição de estoque

1. Usuário acessa estoque baixo.
2. Sistema lista produtos abaixo do mínimo.
3. Usuário seleciona produtos para compra.
4. Registra fornecedor e quantidade comprada.
5. Confirma entrada.
6. Sistema atualiza estoque.
7. Produto sai da lista de alerta, caso volte ao nível mínimo.

---

## 8.7 Fluxo de ordem de serviço

1. Usuário acessa “Serviços”.
2. Cria nova ordem.
3. Seleciona cliente.
4. Descreve serviço solicitado.
5. Adiciona produtos ou peças, se necessário.
6. Define mão de obra.
7. Atualiza status conforme andamento.
8. Ao concluir, converte em venda.
9. Sistema registra cobrança e baixa produtos utilizados.

---

## 9. Requisitos não funcionais

### 9.1 Usabilidade

* Sistema deve ser compreensível para usuários sem treinamento técnico.
* As ações principais devem exigir poucos cliques.
* Textos devem ser simples e diretos.
* Interface deve funcionar bem em computador, tablet e celular.

### 9.2 Performance

* Dashboard deve carregar rapidamente.
* Busca de produtos e clientes deve responder quase instantaneamente em bases pequenas e médias.
* Registro de venda deve ser fluido, sem telas lentas.

### 9.3 Segurança

* Senhas armazenadas com criptografia adequada.
* Sessões com expiração.
* Permissões por perfil.
* Isolamento de dados por empresa.
* Registro de ações críticas.

### 9.4 Confiabilidade

* Operações de venda e estoque devem ser transacionais.
* Uma venda não pode ser confirmada pela metade.
* Cancelamentos devem manter histórico.
* O sistema deve evitar perda de dados em quedas de conexão.

### 9.5 Responsividade

* Desktop como experiência principal.
* Tablet como experiência secundária.
* Celular com suporte para consultas, vendas rápidas e dashboard simplificado.

---

## 10. Modelo de dados inicial

### Empresa

* id
* nome fantasia
* razão social
* CPF/CNPJ
* telefone
* endereço
* segmento
* data de criação

### Usuário

* id
* empresa_id
* nome
* e-mail
* senha
* perfil
* status
* último acesso

### Cliente

* id
* empresa_id
* nome
* telefone
* e-mail
* documento
* endereço
* etiquetas
* observações
* status

### Produto

* id
* empresa_id
* nome
* SKU
* código de barras
* categoria
* preço de custo
* preço de venda
* estoque atual
* estoque mínimo
* fornecedor_id
* status

### Venda

* id
* empresa_id
* cliente_id
* usuário_id
* caixa_id
* data
* subtotal
* desconto
* total
* status
* forma de pagamento

### Item da venda

* id
* venda_id
* produto_id
* quantidade
* preço unitário
* desconto
* total

### Movimento de estoque

* id
* empresa_id
* produto_id
* tipo
* quantidade
* motivo
* referência
* usuário_id
* data

### Caixa

* id
* empresa_id
* usuário_abertura_id
* usuário_fechamento_id
* valor inicial
* valor esperado
* valor informado
* diferença
* status
* data abertura
* data fechamento

### Conta a receber

* id
* empresa_id
* cliente_id
* venda_id
* valor original
* valor pago
* saldo
* vencimento
* status

### Despesa

* id
* empresa_id
* descrição
* categoria
* valor
* vencimento
* pagamento
* status
* fornecedor_id

### Ordem de serviço

* id
* empresa_id
* cliente_id
* descrição
* status
* valor mão de obra
* valor produtos
* total
* prazo
* data criação
* data conclusão

---

## 11. Permissões

### Administrador

Pode acessar:

* dashboard completo;
* usuários;
* clientes;
* produtos;
* estoque;
* vendas;
* caixa;
* financeiro;
* relatórios;
* configurações;
* importação e exportação.

### Gerente

Pode acessar:

* clientes;
* produtos;
* estoque;
* vendas;
* caixa;
* relatórios operacionais;
* ordens de serviço;
* orçamentos.

Não pode:

* alterar plano;
* excluir usuários;
* acessar configurações sensíveis.

### Operador

Pode acessar:

* clientes;
* consulta de produtos;
* nova venda;
* ordens de serviço;
* orçamentos;
* caixa operacional, se permitido.

Não pode:

* ver lucro;
* ver despesas;
* excluir registros críticos;
* alterar permissões;
* acessar relatórios financeiros.

---

## 12. MVP recomendado

O MVP deve ser útil de verdade, não apenas um cadastro com venda simples.

### Entram no MVP

* autenticação;
* empresa e usuários;
* perfis de acesso;
* clientes;
* produtos;
* controle de estoque;
* vendas;
* múltiplas formas de pagamento;
* contas a receber;
* caixa e fechamento diário;
* despesas básicas;
* dashboard prático;
* alertas internos;
* relatórios simples;
* importação inicial de clientes e produtos via CSV.

### Podem ficar para fase 2

* ordens de serviço completas;
* orçamentos avançados;
* código de barras com leitor;
* integração com WhatsApp;
* aplicativo mobile nativo;
* emissão de nota fiscal;
* integração bancária;
* integração com meios de pagamento;
* recorrência automática de despesas;
* múltiplas filiais;
* permissões customizadas por usuário.

---

## 13. Fora do escopo do MVP

* emissão de nota fiscal;
* integração automática com Pix, cartão ou bancos;
* marketplace;
* e-commerce;
* aplicativo mobile nativo;
* múltiplas filiais;
* contabilidade completa;
* folha de pagamento;
* CRM avançado;
* automação de marketing;
* assinatura eletrônica;
* BI avançado.

---

## 14. Métricas de sucesso

### Ativação

* Percentual de empresas que cadastram pelo menos 10 produtos.
* Percentual de empresas que registram a primeira venda no primeiro dia.
* Tempo médio até a primeira venda registrada.

### Uso recorrente

* Empresas com vendas registradas em pelo menos 5 dias por semana.
* Quantidade média de vendas por empresa.
* Frequência de abertura e fechamento de caixa.

### Valor percebido

* Redução de erros de estoque.
* Quantidade de contas a receber acompanhadas.
* Uso do dashboard pelo administrador.
* Retenção após 30 dias.

### Eficiência

* Tempo médio para registrar uma venda.
* Tempo médio para cadastrar produto.
* Tempo médio para fechar caixa.

---

## 15. Critérios de aceitação gerais

* Um usuário operador deve conseguir registrar uma venda em menos de 1 minuto.
* O estoque deve ser atualizado automaticamente após venda confirmada.
* Uma venda cancelada deve devolver estoque.
* O dashboard deve refletir vendas do dia e do mês.
* O caixa deve permitir abertura, movimentação e fechamento.
* Uma venda pendente deve gerar conta a receber.
* Produto com estoque baixo deve aparecer em alerta.
* Cliente com dívida vencida deve aparecer sinalizado.
* Administrador deve conseguir diferenciar permissões de usuários.
* Dados financeiros sensíveis não devem aparecer para operador.

---

## 16. Riscos

### Complexidade excessiva

O produto pode ficar parecido com um ERP tradicional e perder simplicidade.

Mitigação: priorizar fluxos rápidos, linguagem simples e módulos essenciais.

### Baixa adoção por usuários pouco técnicos

Usuários podem abandonar o sistema se o cadastro inicial for difícil.

Mitigação: onboarding guiado, importação por planilha e exemplos prontos.

### Dados incorretos de estoque

Se o estoque inicial for mal cadastrado, os relatórios perdem valor.

Mitigação: permitir ajustes com motivo e destacar inconsistências.

### Falta de disciplina no uso

Se funcionários não registrarem vendas, o sistema perde utilidade.

Mitigação: tornar o registro de venda mais rápido que anotar manualmente.

---

## 17. Direção estratégica

O GestãoSimples deve ser construído com a seguinte prioridade:

1. Venda rápida.
2. Estoque confiável.
3. Caixa claro.
4. Clientes organizados.
5. Financeiro básico.
6. Relatórios simples.
7. Expansão para serviços e automações.

O produto deve sempre responder às perguntas mais importantes do pequeno empresário:

* Quanto vendi hoje?
* Quanto tenho para receber?
* O caixa bateu?
* O que está acabando no estoque?
* Quem está devendo?
* Quais produtos vendem mais?
* Meu mês está indo bem ou mal?
