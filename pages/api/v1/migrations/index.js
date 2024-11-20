import migrationRunner from "node-pg-migrate"; //o migrationRunner será a função que roda o node-pg-migrate. Para isso precisamos passar um objeto como parâmetro dessa função, que tenha todas as informações necessárias para rodar nossas migrations. E como resultado retornar um objeto contendo as seguintes informações {path:,name:,timestamp:,}
import { join } from "node:path"; //importamos a função join do node:path para garantir que a forma como que o caminho do arquivo está sendo passado seja compatível com o sistema operacional que está executando

export default async function migrations(request, response) {
  //criamos uma variável que carrega o objeto contendo as opções padrão das nossas migrations
  const defaultMigrationsOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };

  //Nesse ponto do código verificamos o método da requisição.
  //O método GET irá rodar nossas migrations em modo dry run (ensaio ou teste que permite avaliar a execução de uma tarefa antes de iniciá-la de fato)
  //Já o POST roda em live run (pra valer!)

  if (request.method === "GET") {
    const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      //... -> spread(espalhar). Como se tivessemos copiado e colado o conteúdo dessa variável aqui. Ele nos permite sobrescrever as propriedades do objeto que foi espalhado.
      ...defaultMigrationsOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      //aqui estamos analisando se alguma migrations foi retornada (rodou/executou) ao chamarmos o endpoint /migrations. Se rodou retornamos o status 201(created)
      return response.status(201).json(migratedMigrations);
    }
    //caso o retorno seja um array vazio, então temos o status code 200(OK), que indica que não existe mais migrations para serem rodadas
    return response.status(200).json(migratedMigrations);
  }
  //caso esse endpoint seja chamado por outro método sem ser o GET or POST. Retornamos status code 405(Method Not Allowed)
  return response.status(405).end();
}
