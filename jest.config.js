const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

module.exports = jestConfig;

/*
 "Migrations - EndPoint": [
    "Para criarmos o EndPoint, precisamos primeiramente importar o migrationRunner, que irá rodar as migrações. Quando importado utilizamos o comando com await(já que é um comando assincrono) e indicamos a ele um objeto com diversas propriedades, como, a url do banco, o diretório das migrações, a direção que irá executar, etc",
    "Para os processos funcionarem de forma correta não podemos roda-los de forma paralela, já que cada test muda o state do banco, ficando complicado a execução dos mesmo, para fazermos isso, precisamos colocar no comando que executamos o parâmetro --runInBand",
  ],

    "jest.config.js": [
    "O jest possui algumas limitações que podem nos atrapalhar ao decorrer do projeto, como: não transpilar os arquivos, não conseguir ler arquivos .env, não conseguir usar absolute imports",
    "Podemos resolver essas inconsistências usando o arquivo de configuração do jest, jest.config.js",
    "Nele, primeiramente, precisamos importar o modulo next/jest para o next dar 'poderes' ao jest. Feito isso agora precisamos executar a função factory desse modulo nextJest() e guarda-la em uma constante(já que precisamos guardar a nova função gerada para executarmos). Depois precisamos executar essa função, passando junto um objeto com as configurações, e guardar em outra constante, para que no final possamos exportar.",
    {
      "configurações do objeto": [
        "moduleDirectories: ['node_modules', '<rootDir>']"
      ]
    }
  ],
*/
