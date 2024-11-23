import migrationRunner from "node-pg-migrate"; //o migrationRunner será a função que roda o node-pg-migrate. Para isso precisamos passar um objeto como parâmetro dessa função, que tenha todas as informações necessárias para rodar nossas migrations. E como resultado retornar um objeto contendo as seguintes informações {path:,name:,timestamp:,}
import { join } from "node:path"; //importamos a função join do node:path para garantir que a forma como que o caminho do arquivo está sendo passado seja compatível com o sistema operacional que está executando
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    //caso esse endpoint seja chamado por outro método sem ser o GET or POST. Retornamos status code 405(Method Not Allowed)
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;
  try {
    //criamos uma variável que carrega o objeto contendo as opções padrão das nossas migrations
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = {
      //ao instalar o módulo dotenv, demos ao node-pg-migration o poder de acessar o arquivo das variáveis de ambiente
      //para conseguir interpolar variáveis dentro do .env.development usamos o dotenv-expand
      //databaseUrl: process.env.DATABASE_URL,
      dbClient: dbClient,
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
      await dbClient.end(); // Como estamos usando o dbClient para passar o client do banco de dados pra migrations, fica sob nossa responsabilidade fechar a connection; caso contrário após rodar as migrations o banco ficarar lock
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
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end(); // Como estamos usando o dbClient para passar o client do banco de dados pra migrations, fica sob nossa responsabilidade fechar a connection; caso contrário após rodar as migrations o banco ficarar lock
  }
}
