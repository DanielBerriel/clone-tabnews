import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers); //passamos o objeto de configuração que está presente na propriedade errorHandlers do objeto controller retornado pelo módulo que ficou responsável por encapsular essas tratativas.

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, //dividimos por mil para transformar de milisegundos em segundos
    secure: process.env.NODE_ENV === "production", //dessa forma continuamos pordendo usar o http para fazer testes localmente
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie); //`"Set-Cookie", session_id=${newSession.token}; Path=/`

  return response.status(201).json(newSession);
}
