import * as cookie from "cookie";
import session from "models/session.js";
import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  //o try é tudo que está dentro das funções handler
  //enquanto esse código é relativo ao bloco catch que captura e trata o erro

  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.error(publicErrorObject);

  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000, //dividimos por mil para transformar de milisegundos em segundos
    secure: process.env.NODE_ENV === "production", //dessa forma continuamos pordendo usar o http para fazer testes localmente
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie); //`"Set-Cookie", session_id=${newSession.token}; Path=/`
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler, //objeto de configuração. No caso de não encontrar um tratador para a rota, devemos o usar o tratador onNoMatchHandler.
    onError: onErrorHandler,
  },
  setSessionCookie,
};

export default controller;
