import retry from "async-retry";
import { faker } from "@faker-js/faker";

import database from "infra/database.js";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";
import activation from "models/activation";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

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

  async function waitForEmailServer() {
    //Aqui vamos ficar tentando acessar o endpoint /status até conseguir!
    //Para isso usamos um módulo retry. O async-retry. Na função retry passamos a função que ficará sendo testada no retry. Como segundo parâmetro podemos passar um objeto de configuração, que no nosso caso tem a cantidade de tentativas que devem ser feitas no retry.
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop(); //pega o último item do array, que no caso é o último email enviado

  if (!lastEmailItem) {
    return null;
  }

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`, //Para pergarmos o corpo do email precisamos fazer uma requisição desse tipo. ".plain" para retornar a versão do corpo em texto simples. Poderiamos usar tambem ".html" para retornar o corpo em html
  );
  const emailTextBody = await emailTextResponse.text(); //o que vai vir aqui não é um json e sim um texto simples

  lastEmailItem.text = emailTextBody; //Adicionando o corpo do email como uma nova propriedade 'text' no lastEmailItem
  return lastEmailItem;
}

function extractUUID(text) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

async function activateUser(inactiveUser) {
  return await activation.activateUserByUserId(inactiveUser.id);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  activateUser,
};

export default orchestrator;
