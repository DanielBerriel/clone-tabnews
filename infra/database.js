import { Client } from "pg";
import { ServiceError } from "./errors.js";

async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      message: "Erro na conexão com Banco ou na Query.",
      cause: error,
    });
    throw serviceErrorObject;
  } finally {
    await client?.end(); //'?' Optional Chaining (Encadeamento Opcional); Vai verificar se esse client existe ou não, no nosso caso se ele é undefined, porque existir ele existe, já que foi declarado anteriormente.Dessa forma ele não vai lançar um erro, só retorna undefined.
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });

  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  //SALVEI NO BLOCO DE NOTAS UMA EXPLICAÇÃO DESSA PARTE
  /*if(process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA, 
    }
  }
  */

  return process.env.NODE_ENV === "production" ? true : false;
}
