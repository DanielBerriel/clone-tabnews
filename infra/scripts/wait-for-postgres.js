//Utilizamos o módulo child_process do node. Esse modo permite criar um processo filho e puxar o método exec, que nos permite executar comandos externos;
const { exec } = require("node:child_process");

function checkPostgres() {
  //Nessa situação o método exec aceita dois parâmetros por padrão. O comando em si e uma função de callback.
  //Ao utilizar o --host localhost, fazemos o pg_isready que trabalha com uma conexão socket UNIX, que é uma maneira de se comunicar sem usar a rede interna (diretamente pelo sistema de arquivos do sistema operacional, sendo mais rápido e leve);
  //Só que como o node pg-migrate utiliza TCP/IP (se conecta na instância que está em localhost) e isso causa uma condição de corrida. Que pode ser facilmente resolvida com esse comando que faz o pg-isready verificar a conexão TCP/IP.
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    //error (execução com erro), stdout (standard output), stderr (standard error)
    //stdout e stderr são canais pré-definidos que os programas usam pra se comunicar entre si. Sendo o stdout usado para exibir a saída de um programa. E stderr para exibir a saída de error.
    //método search busca algo dentro da string. Caso esse método não encontre o valor buscado, retorna -1
    if (stdout.search("accepting connections") === -1) {
      //vamos usar o process.stdout.write no lugar de um console.log. O write escreve na saída do processo. Fazemos isso porque o console.log gera uma quebra de linha por padrão e iria atrapalhar a visualização que queremos construir.
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres está pronto e aceitando conexões!\n");
  }
}

process.stdout.write("\n\n🔴 Aguardando Postgres aceitar conxões");
checkPostgres();
