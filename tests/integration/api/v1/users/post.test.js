import { version as uuidVersion } from "uuid"; //desestruturando o método version de uuid e aplicando um apelido
import orchestrator from "tests/orchestrator.js";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indica que é um dado que será consumido por uma aplicação e especifica o formato dos dados enviados (json). Essa especificação prepara a ponta que irá receber a requisição, para que interprete o cabeçalho da maneira correta.
        },
        body: JSON.stringify({
          username: "daniel",
          email: "danielberriel163@gmail.com",
          password: "senha123",
        }),
      });

      expect(response.status).toBe(201); //201 (created)

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "daniel",
        email: "danielberriel163@gmail.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN(); //Se o valor passado no Date.parse() não for do tipo data, a função retornarar um NaN
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("daniel");
      const correctPasswordMatch = await password.compare(
        "senha123",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indica que é um dado que será consumido por uma aplicação e especifica o formato dos dados enviados (json). Essa especificação prepara a ponta que irá receber a requisição, para que interprete o cabeçalho da maneira correta.
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@curso.dev",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201); //201 (created)

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indica que é um dado que será consumido por uma aplicação e especifica o formato dos dados enviados (json). Essa especificação prepara a ponta que irá receber a requisição, para que interprete o cabeçalho da maneira correta.
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@curso.dev",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(400); //400 (bad request)

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indica que é um dado que será consumido por uma aplicação e especifica o formato dos dados enviados (json). Essa especificação prepara a ponta que irá receber a requisição, para que interprete o cabeçalho da maneira correta.
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "usernameduplicado1@curso.dev",
          password: "senha123",
        }),
      });

      expect(response1.status).toBe(201); //201 (created)

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", //indica que é um dado que será consumido por uma aplicação e especifica o formato dos dados enviados (json). Essa especificação prepara a ponta que irá receber a requisição, para que interprete o cabeçalho da maneira correta.
        },
        body: JSON.stringify({
          username: "UsernameDuplicado",
          email: "usernameduplicado2@curso.dev",
          password: "senha123",
        }),
      });

      expect(response2.status).toBe(400); //400 (bad request)

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        status_code: 400,
      });
    });
  });
});
