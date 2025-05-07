import migrationRunner from "node-pg-migrate"; //o migrationRunner será a função que roda o node-pg-migrate. Para isso precisamos passar um objeto como parâmetro dessa função, que tenha todas as informações necessárias para rodar nossas migrations. E como resultado retornar um objeto contendo as seguintes informações {path:,name:,timestamp:,}
import { resolve } from "node:path"; //importamos a função resolve do node:path para garantir que a forma como que o caminho do arquivo está sendo passado seja compatível com o sistema operacional que está executando
import database from "infra/database.js";

const defaultMigrationsOptions = {
  //ao instalar o módulo dotenv, demos ao node-pg-migration o poder de acessar o arquivo das variáveis de ambiente
  //para conseguir interpolar variáveis dentro do .env.development usamos o dotenv-expand
  //databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  log: () => {},
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;

  try {
    //criamos uma variável que carrega o objeto contendo as opções padrão das nossas migrations
    dbClient = await database.getNewClient();

    //Nesse ponto do código verificamos o método da requisição.
    //O método GET irá rodar nossas migrations em modo dry run (ensaio ou teste que permite avaliar a execução de uma tarefa antes de iniciá-la de fato)
    //Já o POST roda em live run (pra valer!)
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dbClient,
    });
    return pendingMigrations;
  } finally {
    await dbClient?.end(); // Como estamos usando o dbClient para passar o client do banco de dados pra migrations, fica sob nossa responsabilidade fechar a connection; caso contrário após rodar as migrations o banco ficarar lock
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    //criamos uma variável que carrega o objeto contendo as opções padrão das nossas migrations
    dbClient = await database.getNewClient();

    //Nesse ponto do código verificamos o método da requisição.
    //O método GET irá rodar nossas migrations em modo dry run (ensaio ou teste que permite avaliar a execução de uma tarefa antes de iniciá-la de fato)
    //Já o POST roda em live run (pra valer!)
    const migratedMigrations = await migrationRunner({
      //... -> spread(espalhar). Como se tivessemos copiado e colado o conteúdo dessa variável aqui. Ele nos permite sobrescrever as propriedades do objeto que foi espalhado.
      ...defaultMigrationsOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    await dbClient?.end(); // Como estamos usando o dbClient para passar o client do banco de dados pra migrations, fica sob nossa responsabilidade fechar a connection; caso contrário após rodar as migrations o banco ficarar lock
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
