// =============================================
// GASTO CONTROLADO — script.js
// =============================================


// =============================================
// 1. DADOS DA APLICAÇÃO
// =============================================

// Nome da "gaveta" onde os gastos ficam guardados no localStorage
const CHAVE_STORAGE = "gastocontrolado:gastos";

// Gastos de exemplo, usados só na primeira vez que o site abre
const gastosExemplo = [
  { id: 1, descricao: "Almoço no restaurante", valor: 35, data: "2026-10-01", categoria: "alimentacao", tipo: "despesa", observacoes: "Almoço com a turma da faculdade." },
  { id: 2, descricao: "Passagem de ônibus", valor: 5.5, data: "2026-10-02", categoria: "transporte", tipo: "despesa", observacoes: "" },
  { id: 3, descricao: "Mesada", valor: 200, data: "2026-10-03", categoria: "outros", tipo: "receita", observacoes: "" }
];

// Array principal: começa com o que estiver salvo no localStorage
let gastos = carregarGastos();

const nomesCategorias = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  lazer: "Lazer",
  estudos: "Estudos",
  saude: "Saúde",
  outros: "Outros"
};


// =============================================
// 2. ELEMENTOS DO HTML
// =============================================
const listaGastos = document.querySelector("#lista-gastos");
const formGasto = document.querySelector("#form-gasto");
const mensagem = document.querySelector("#mensagem");


// =============================================
// 3. FUNÇÕES DE FORMATAÇÃO
// =============================================
function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarTipo(tipo) {
  return tipo === "despesa" ? "Despesa" : "Receita";
}

// Evita que um texto digitado com "<" ou ">" vire HTML de verdade
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}


// =============================================
// 4. LOCALSTORAGE (salvar e carregar)
// =============================================
function salvarGastos() {
  // localStorage só guarda texto, por isso transformamos o array em JSON
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(gastos));
}

function carregarGastos() {
  const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

  // Primeira vez: ainda não tem nada salvo
  if (dadosSalvos === null) {
    return [...gastosExemplo];
  }

  try {
    // Transforma o texto JSON de volta em array
    return JSON.parse(dadosSalvos);
  } catch (erro) {
    return [];
  }
}


// =============================================
// 5. FEEDBACK AO USUÁRIO
// =============================================
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo; // "sucesso", "erro" ou "info"
}


// =============================================
// 7. LISTAGEM DINÂMICA
// =============================================
function renderizarGastos() {
  listaGastos.innerHTML = ""; // limpa a tabela antes de desenhar

  const lista = gastos;

  for (const gasto of lista) {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${escaparHTML(gasto.descricao)}</td>
      <td>${nomesCategorias[gasto.categoria]}</td>
      <td>${formatarTipo(gasto.tipo)}</td>
      <td><time datetime="${gasto.data}">${formatarData(gasto.data)}</time></td>
      <td>${formatarValor(gasto.valor)}</td>
      <td>
        <button type="button" data-id="${gasto.id}" class="btn-detalhes">Ver detalhes</button>
        <button type="button" data-id="${gasto.id}" class="btn-editar">Editar</button>
        <button type="button" data-id="${gasto.id}" class="btn-excluir">Excluir</button>
      </td>
    `;

    listaGastos.appendChild(linha);
  }
}


// =============================================
// 11. CADASTRO E EDIÇÃO
// Capturar → Validar → Montar o objeto → Guardar → Atualizar
// =============================================
formGasto.addEventListener("submit", function (evento) {
  evento.preventDefault(); // impede a página de recarregar

  // 1. Capturar os dados
  const descricao = document.querySelector("#descricao").value.trim();
  const valorDigitado = parseFloat(document.querySelector("#valor").value);
  const data = document.querySelector("#data").value;
  const categoria = document.querySelector("#categoria").value;
  const tipo = document.querySelector("input[name='tipo']:checked").value;
  const observacoes = document.querySelector("#observacoes").value.trim();

  // 2. Validar
  if (descricao.length < 3) {
    mostrarMensagem("A descrição precisa ter pelo menos 3 letras.", "erro");
    return;
  }
  if (isNaN(valorDigitado) || valorDigitado <= 0) {
    mostrarMensagem("Informe um valor maior que zero.", "erro");
    return;
  }
  if (data === "" || categoria === "") {
    mostrarMensagem("Preencha a data e a categoria.", "erro");
    return;
  }

  // 3. Montar o objeto
  const dadosGasto = {
    descricao: descricao,
    valor: valorDigitado,
    data: data,
    categoria: categoria,
    tipo: tipo,
    observacoes: observacoes
  };

  // Guardar no array
  let textoSucesso = "Gasto cadastrado com sucesso!";

  dadosGasto.id = Date.now(); // número único para identificar o gasto
  gastos.push(dadosGasto);

  // Salvar e atualizar a tela
  salvarGastos();
  renderizarGastos();
  formGasto.reset();
  mostrarMensagem(textoSucesso, "sucesso");
});


// =============================================
// INÍCIO: desenha a tabela assim que a página carrega
// =============================================
renderizarGastos();