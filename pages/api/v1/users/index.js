import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers); //passamos o objeto de configuração que está presente na propriedade errorHandlers do objeto controller retornado pelo módulo que ficou responsável por encapsular essas tratativas.

async function postHandler(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  // 1. Criar o Token de Ativação
  const activationToken = await activation.create(newUser.id);
  // 2. Enviar esse Token por Email
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(newUser);
}
