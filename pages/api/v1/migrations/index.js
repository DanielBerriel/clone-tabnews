import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers); //passamos o objeto de configuração que está presente na propriedade errorHandlers do objeto controller retornado pelo módulo que ficou responsável por encapsular essas tratativas.

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    //aqui estamos analisando se alguma migrations foi retornada (rodou/executou) ao chamarmos o endpoint /migrations. Se rodou retornamos o status 201(created)
    return response.status(201).json(migratedMigrations);
  }
  //caso o retorno seja um array vazio, então temos o status code 200(OK), que indica que não existe mais migrations para serem rodadas
  return response.status(200).json(migratedMigrations);
}
