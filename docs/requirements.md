# Análise do Projeto - Sistema de Gerenciamento de Voos

Este documento detalha a estrutura, ferramentas e regras de negócio do projeto `entrevista-backend-dinheirow`.

## 1. Visão Geral
O projeto é um sistema de backend para gerenciamento de voos, passageiros e tickets, desenvolvido para fins de entrevista técnica. Ele utiliza uma arquitetura em camadas e suporta múltiplos bancos de dados de forma alternável.

## 2. Stack Tecnológica
- **Linguagem:** TypeScript
- **Runtime:** Node.js (v24+)
- **Framework Web:** Express com `routing-controllers`
- **Validação:** `class-validator` e `class-transformer`
- **Bancos de Dados (Estratégia Strategy):**
  - **MongoDB:** Mongoose
  - **PostgreSQL:** `pg-mem` (em memória para testes/desenvolvimento)
- **Testes:** Mocha, Chai e Supertest
- **Linter/Formatador:** Prettier

## 3. Estrutura do Projeto
O projeto segue princípios de Clean Architecture / DDD:

- `src/domain`: Núcleo do negócio. Contém entidades, objetos de valor e interfaces de serviço.
- `src/application`: Serviços de aplicação que orquestram a lógica do domínio e interagem com a infraestrutura.
- `src/infra`: Implementações técnicas (Controladores API, Estratégias de Banco de Dados, Modelos Mongoose).
- `test/`: Testes de integração e unidade.
- `scripts/`: Scripts auxiliares.

## 4. Regras de Negócio e Requisitos

### Voos (Flights)
- **Atributos:** Código do voo, origem, destino, status e capacidade máxima.
- **Validação de Código:** O código do voo deve seguir um padrão que identifique a companhia aérea (ex: GOL, AZU, TAM).
- **Status:** Atualmente monitora status como 'ACTIVE'.
- **Assentos:** O cálculo de assentos disponíveis deve considerar a capacidade máxima menos o total de passageiros (⚠️ *Atualmente hardcoded como 10*).
- **Regras de Reserva:** Passageiros só podem ser adicionados a voos com status 'ACTIVE'.

### Tarifação (Pricing)
- O sistema possui uma estratégia de tarifação (`StandardPricingStrategy`).
- ⚠️ *Atualmente a lógica está pendente de implementação (retorna 0).*

### Banco de Dados
- O tipo de banco de dados é definido pela variável de ambiente `DB_TYPE` (`mongo` ou `postgres`).

## 5. Endpoints da API (v1)
Prefixo: `/api/v1`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/flights/flights` | Listar todos os voos (⚠️ *Rota possivelmente duplicada/incorreta*) |
| GET | `/flights/:code` | Buscar voo por código |
| POST | `/flights` | Cadastrar novo voo |
| PUT | `/flights/:code` | Atualizar status do voo |

## 6. Observações e Possíveis Melhorias Identificadas
1. **Inconsistência de Rotas:** A rota de listagem está como `/flights/flights` devido à anotação no controlador.
2. **Código Duplicado:** Existe um diretório `src/services` que é duplicata do `src/application`. O controlador utiliza o `src/application`.
3. **Lógica Pendente:** Implementar o cálculo real de `availableSeats` e a `StandardPricingStrategy`.
4. **Configuração de Controllers:** O `index.ts` busca controllers em `src/controllers`, mas eles estão em `src/infra/controllers`.
