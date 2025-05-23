import { createRouter } from "next-connect"; //Extraindo o createRouter do módulo next-connect. Função que constrói rotas de maneira integrada ao nextjs.
import database from "infra/database.js";
import controller from "infra/controller.js";

const router = createRouter();

//handler do get = (...)
router.get(getHandler); //função getHandler definida como o tratador

export default router.handler(controller.errorHandlers); //passamos o objeto de configuração que está presente na propriedade errorHandlers do objeto controller retornado pelo módulo que ficou responsável por encapsular essas tratativas.

async function getHandler(request, response) {
  //Controller
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const databaseOpenedConnectionsResult = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].count;

  //View
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      },
    },
  });
}
