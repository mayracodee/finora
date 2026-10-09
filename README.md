# Finora — Gestão Financeira Pessoal

O **Finora** é uma aplicação web de gestão financeira pessoal desenvolvida para ajudar usuários a organizar suas compras, acompanhar despesas fixas e controlar os gastos dos cartões de crédito em um só lugar.

O projeto foi desenvolvido com foco em organização financeira, visualização de informações e experiência do usuário, com uma interface responsiva para desktop e dispositivos móveis.

Acesse o projeto: https://finora-controle.vercel.app

## Funcionalidades

- **Autenticação de usuários:** cadastro, login e recuperação de senha.
- **Gerenciamento de cartões:** cadastro, edição e exclusão de cartões, com configuração dos dias de fechamento e vencimento.
- **Registro de compras:** cadastro de compras com valores, categorias e parcelamento.
- **Controle de despesas fixas:** registro e gerenciamento de despesas recorrentes, vinculadas aos cartões.
- **Resumo financeiro:** visualização dos valores previstos para o mês atual e o próximo mês.
- **Controle de gastos:** definição de limites mensais por cartão, acompanhamento dos gastos e identificação de limites atingidos ou ultrapassados.
- **Gastos por categoria:** consulta dos gastos por mês, incluindo compras parceladas e despesas fixas.
- **Interface responsiva:** layout adaptado para desktop e dispositivos móveis.

## Tecnologias utilizadas

- React
- JavaScript
- Vite
- Supabase
- React Router
- CSS3

## Como executar o projeto localmente

### Pré-requisitos

- Node.js e npm instalados.
- Uma conta no Supabase.
- Acesso às configurações e ao banco de dados do projeto.

### Instalação

1. Clone este repositório:

   ```bash
   git clone URL_DO_REPOSITORIO
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd finora
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Configure as variáveis de ambiente necessárias para a conexão com o Supabase, conforme a implementação do projeto.

5. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

6. Acesse o endereço local informado pelo Vite no terminal.

## Banco de dados e autenticação

O Finora utiliza o Supabase para autenticação e persistência dos dados financeiros dos usuários.

A configuração local exige as credenciais públicas de conexão utilizadas pelo projeto. Nunca publique chaves secretas, senhas ou credenciais administrativas no repositório.

## Interface

As capturas de tela do projeto serão adicionadas aqui para demonstrar o dashboard, o gerenciamento de cartões, o cadastro de despesas e o controle de gastos.

## Objetivo do projeto

O Finora faz parte do meu desenvolvimento como profissional Front-End e representa a aplicação prática de conhecimentos em React, JavaScript, integração com banco de dados, autenticação, organização de componentes, gerenciamento de estado e estilização responsiva.

O objetivo é construir uma ferramenta útil para organização financeira pessoal, mantendo uma interface clara e uma estrutura de código organizada.