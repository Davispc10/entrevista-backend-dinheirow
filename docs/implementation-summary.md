# Implementação: Adicionar Passageiro e Reservar Assento

## Resumo da Implementação

Esta implementação adiciona a funcionalidade completa de cadastro de passageiros e reserva de assentos em voos, conforme especificado na task `1-add-passenger.md`.

## Funcionalidades Implementadas

### 1. **Endpoint POST /api/v1/flights/:code/passengers**

Endpoint para adicionar passageiros e reservar assentos em voos.

**Request Body:**
```json
{
  "id": "uuid-v4",
  "name": "Nome do Passageiro",
  "email": "email@example.com",
  "gender": "Male/Female"
}
```

**Response (201 CREATED - Sucesso):**
```json
{
  "status": 201,
  "data": {
    "id": "uuid",
    "name": "Nome",
    "email": "email@example.com",
    "gender": "Male"
  },
  "reservation": {
    "reserved": true,
    "message": "Assento reservado com sucesso"
  }
}
```

**Response (400 BAD REQUEST - Email duplicado):**
```json
{
  "status": 400,
  "message": "Passenger already exists"
}
```

**Response (500 INTERNAL SERVER ERROR):**
```json
{
  "status": 500,
  "message": "Internal Server Error",
  "error": "Mensagem de erro"
}
```

### 2. **Validações Implementadas**

#### Validação de Dados do Passageiro
- **ID**: UUID válido (obrigatório)
- **Nome**: String não vazia (obrigatório)
- **Email**: Email válido e único (obrigatório)
- **Gênero**: String não vazia (obrigatório)

#### Validação de Reserva de Assento
O passageiro é **sempre criado**, mas o assento só é reservado se:
- ✅ O voo existe
- ✅ O voo está com status `ACTIVE`
- ✅ O voo tem assentos disponíveis (não está lotado)

Caso alguma validação falhe, o passageiro é criado mas sem assento reservado, com mensagens explicativas:
- **Voo não encontrado**: "Voo não encontrado. Assento não reservado."
- **Voo cancelado**: "Voo está com status CANCELLED. Assento não reservado."
- **Voo lotado**: "Voo lotado. Assento não reservado."

#### Validação de Email Único
- Não é possível criar dois passageiros com o mesmo email
- Retorna status 400 com mensagem "Passenger already exists"

### 3. **Estrutura de Banco de Dados**

#### Tabela `passengers`
```sql
CREATE TABLE passengers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(20) NOT NULL
);
```

#### Tabela `tickets`
```sql
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    passenger_id VARCHAR(36) REFERENCES passengers(id),
    flight_code VARCHAR(10) REFERENCES flights(code),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Atualização da Tabela `flights`
```sql
ALTER TABLE flights ADD COLUMN max_capacity INTEGER DEFAULT 180;
```

### 4. **Arquivos Criados/Modificados**

#### Criados:
- `src/infra/controllers/dtos/CreatePassengerDTO.ts` - DTO com validações

#### Modificados:
- `src/infra/databases/postgres/postgres.ts` - Schema e métodos do banco
- `src/infra/databases/database_abstract.ts` - Métodos abstratos
- `src/infra/databases/mongo/mongodb.ts` - Stubs para MongoDB
- `src/application/flights.service.ts` - Lógica de negócio
- `src/infra/controllers/flights.controller.ts` - Endpoint REST
- `test/flights.test.ts` - Testes de integração

### 5. **Testes Implementados**

Todos os testes estão passando (11/11):

✅ **Cenário 1**: Adicionar passageiro e reservar assento com sucesso
- Voo ACTIVE com capacidade disponível
- Passageiro criado e assento reservado

✅ **Cenário 2**: Voo não existe
- Passageiro criado, mas sem assento reservado
- Mensagem explicativa retornada

✅ **Cenário 3**: Voo cancelado
- Passageiro criado, mas sem assento reservado
- Mensagem indica status CANCELLED

✅ **Cenário 4**: Voo lotado
- Passageiro criado, mas sem assento reservado
- Mensagem indica voo lotado

✅ **Cenário 5**: Email duplicado
- Retorna 400 BAD REQUEST
- Passageiro não é criado

### 6. **Dados de Bootstrap**

Voos pré-cadastrados para testes:
```sql
INSERT INTO flights (code, origin, destination, status, max_capacity)
VALUES 
    ('GOL-123', 'LHS', 'GAO', 'ACTIVE', 180),    -- Voo ativo com capacidade
    ('TAM-124', 'CGH', 'NYC', 'CANCELLED', 180), -- Voo cancelado
    ('AZU-125', 'FOR', 'LAX', 'ACTIVE', 1);      -- Voo com capacidade 1
```

## Tecnologias Utilizadas

- **TypeScript** - Linguagem principal
- **Express** - Framework web
- **routing-controllers** - Decorators para rotas
- **class-validator** - Validação de DTOs
- **pg-mem** - Banco de dados PostgreSQL em memória
- **Mocha** - Framework de testes
- **Supertest** - Testes de API

## Status Codes Utilizados

- **201 CREATED** - Passageiro criado com sucesso (com ou sem reserva)
- **400 BAD REQUEST** - Email duplicado ou dados inválidos
- **500 INTERNAL SERVER ERROR** - Erro interno do servidor

## Conclusão

A implementação está completa e todos os requisitos foram atendidos:
- ✅ Endpoint funcional com validações
- ✅ DTOs para estrutura de dados
- ✅ Status codes corretos
- ✅ Validações de voo (existência, status, capacidade)
- ✅ Email único por passageiro
- ✅ Testes abrangentes (11 testes passando)
- ✅ Mensagens explicativas para cada cenário
