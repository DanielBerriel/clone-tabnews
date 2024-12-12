import retry from "async-retry";
import database from "infra/database.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    //Aqui vamos ficar tentando acessar o endpoint /status até conseguir!
    //Para isso usamos um módulo retry. O async-retry. Na função retry passamos a função que ficará sendo testada no retry. Como segundo parâmetro podemos passar um objeto de configuração, que no nosso caso tem a cantidade de tentativas que devem ser feitas no retry.
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      //Aqui verificamos se a request ao endpoint /status retorna uma response;
      //Importante destacar que analisar apenas se é possível fazer a requisição (fetch) não garante que o endpoint está execuntando com sucesso, pois um status code de error seria dado como sucesso pelo fetch. Afinal, está sendo feita uma request e retornando uma response (html 404 por exemplo);
      //Por isso o nosso foco precisa ser na resposta da requisição, mas sem se apegar ao seu formato (json), pois isso pode mudar com alterações no /status ao longo do projeto;
      //Separamos assim um erro de rede de uma resposta válida do servidor. Para isso, deixamos de lado uma verificação do responseBody e passamos a focar no status code da responsta da requisição.
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
