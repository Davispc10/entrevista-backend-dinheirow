<title>Adicionar passageiro e reservar assento</title>

<description>
    O objetivo desta task é criar uma API para adicionar passageiros, persistindo-os no BD e, juntamente, reservar um assento no voo selecionado.
</description>

<requirements>
   - O endpoint deve receber a exata estrutura de dados para a criação de um passageiro. Você pode verificar @docs/requirements.md para mais detalhes OU diretamente no código, em @domain/entities/passenger.ts 
      - Valide os dados recebidos, verificando os campos obrigatórios e os tipos de dados.
      - Valide o retorno do BD e no response. É extremamente importante que o response sempre siga uma mesma estrutura de dados. Crie um DTO para isso.
      - Utilize os status codes corretamente. 201 CREATED, 400 BAD REQUEST e 500 INTERNAL SERVER ERROR.
   - Valide os dados do voo selecionado. Não deve ser possível reservar um assento em um voo inexistente, cancelado OU que não tenham assentos disponíveis.
      - Caso ocorra algum dos cenários acima, o passageiro ainda deve ser criado, mas sem um assento reservado. Retorne um status code 201 CREATED e um response com a estrutura de dados do passageiro criado e informando que o assento não foi reservado.
      - Explique o motivo da não reserva do assento no response.
   - Nenhum passageiro deve conter o mesmo email de outro passageiro cadastrado no BD
   - Não é possível criar o mesmo passageiro duas vezes
</requirements>

<tests>
   - Teste os cenários acima.
   - Crie os testes necessários para garantir que o endpoint funcione corretamente.
   - Utilize mocha para a criação dos testes.
   - Salve dentro de @test/flights.test.ts
</tests>
