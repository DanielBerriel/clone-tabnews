const calculadora = require("../models/calculadora.js");

test("verificar se 2 + 2 retorna 4", () => {
  const resultado = calculadora.somar(2, 2);
  expect(resultado).toBe(4);
});

test("verificar se uma String + String or Number retorna ERRO", () => {
  const resultado = calculadora.somar("banana", 2);
  expect(resultado).toBe("Erro");
});

test("verificar se a divisão por zero retorna Erro", () => {
  const resultado = calculadora.dividir(2, 0);
  expect(resultado).toBe("Erro");
});
