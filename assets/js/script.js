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

// Guarda o id do gasto que está sendo editado (null = cadastrando um novo)
let idEmEdicao = null;

// Guarda o id do gasto que está aparecendo nos detalhes
let idDetalhado = null;

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
const listaVazia = document.querySelector("#lista-vazia");
const btnSalvar = document.querySelector("#btn-salvar");
const btnCancelar = document.querySelector("#btn-cancelar");
const detalheGasto = document.querySelector("#detalhe-gasto");
const totalReceitas = document.querySelector("#total-receitas");
const totalDespesas = document.querySelector("#total-despesas");
const saldo = document.querySelector("#saldo");
const formPesquisa = document.querySelector("#listagem form");
const campoPesquisa = document.querySelector("#pesquisa");
const filtroCategoria = document.querySelector("#filtro-categoria");
const filtroTipo = document.querySelector("#filtro-tipo");
const ordenacao = document.querySelector("#ordenacao");
const seletorMoeda = document.querySelector("#moeda");
const infoCotacao = document.querySelector("#info-cotacao");


// =============================================
// 3. FUNÇÕES DE FORMATAÇÃO
// =============================================
function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarMoeda(valor, moeda) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moeda });
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

function buscarGastoPorId(id) {
  return gastos.find(function (gasto) {
    return gasto.id === id;
  });
}


// =============================================
// 5. FEEDBACK AO USUÁRIO
// =============================================
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo; // "sucesso", "erro" ou "info"
}


// =============================================
// 6. PESQUISA, FILTROS E ORDENAÇÃO
// =============================================
function obterGastosVisiveis() {
  const termo = campoPesquisa.value.trim().toLowerCase();
  const categoria = filtroCategoria.value;
  const tipo = filtroTipo.value;

  // 1. Pesquisa + filtros (filter cria um array novo, sem mexer em "gastos")
  const resultado = gastos.filter(function (gasto) {
    const combinaPesquisa = gasto.descricao.toLowerCase().includes(termo);
    const combinaCategoria = categoria === "" || gasto.categoria === categoria;
    const combinaTipo = tipo === "" || gasto.tipo === tipo;

    return combinaPesquisa && combinaCategoria && combinaTipo;
  });

  // 2. Ordenação
  switch (ordenacao.value) {
    case "data-asc":
      resultado.sort((a, b) => a.data.localeCompare(b.data));
      break;
    case "data-desc":
      resultado.sort((a, b) => b.data.localeCompare(a.data));
      break;
    case "valor-asc":
      resultado.sort((a, b) => a.valor - b.valor);
      break;
    case "valor-desc":
      resultado.sort((a, b) => b.valor - a.valor);
      break;
    case "descricao-asc":
      resultado.sort((a, b) => a.descricao.localeCompare(b.descricao, "pt-BR"));
      break;
  }

  return resultado;
}


// =============================================
// 7. LISTAGEM DINÂMICA
// =============================================
function renderizarGastos() {
  listaGastos.innerHTML = ""; // limpa a tabela antes de desenhar

  const lista = obterGastosVisiveis();

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

  // Mostra "Nenhum gasto encontrado" quando a lista está vazia
  listaVazia.hidden = lista.length > 0;

  atualizarResumo();
}


// =============================================
// 8. RESUMO (receitas, despesas e saldo)
// =============================================
function atualizarResumo() {
  let receitas = 0;
  let despesas = 0;

  for (const gasto of gastos) {
    if (gasto.tipo === "receita") {
      receitas += gasto.valor;
    } else {
      despesas += gasto.valor;
    }
  }

  totalReceitas.textContent = formatarValor(receitas);
  totalDespesas.textContent = formatarValor(despesas);
  saldo.textContent = formatarValor(receitas - despesas);
}


// =============================================
// 9. DETALHES
// =============================================
function mostrarDetalhes(id) {
  const gasto = buscarGastoPorId(id);

  // Se não achou (ou foi excluído), volta para a mensagem inicial
  if (!gasto) {
    idDetalhado = null;
    detalheGasto.innerHTML = `<p>Clique em "Ver detalhes" em um gasto da lista.</p>`;
    return;
  }

  idDetalhado = id;

  // Se o gasto foi em outra moeda, mostra o valor original e a cotação
  let linhasMoeda = "";
  if (gasto.moeda && gasto.moeda !== "BRL") {
    linhasMoeda = `
        <dt>Valor original</dt>
        <dd>${formatarMoeda(gasto.valorOriginal, gasto.moeda)}</dd>

        <dt>Cotação usada</dt>
        <dd>1 ${gasto.moeda} = ${formatarValor(gasto.cotacao)}</dd>
    `;
  }

  const observacoes = gasto.observacoes ? escaparHTML(gasto.observacoes) : "Nenhuma";

  detalheGasto.innerHTML = `
    <article>
      <h3>${escaparHTML(gasto.descricao)}</h3>

      <dl>
        <dt>Categoria</dt>
        <dd>${nomesCategorias[gasto.categoria]}</dd>

        <dt>Tipo</dt>
        <dd>${formatarTipo(gasto.tipo)}</dd>

        <dt>Data</dt>
        <dd><time datetime="${gasto.data}">${formatarData(gasto.data)}</time></dd>

        <dt>Valor</dt>
        <dd>${formatarValor(gasto.valor)}</dd>
        ${linhasMoeda}

        <dt>Observações</dt>
        <dd>${observacoes}</dd>
      </dl>

      <button type="button" data-id="${gasto.id}" class="btn-editar">Editar</button>
      <button type="button" data-id="${gasto.id}" class="btn-excluir">Excluir</button>
    </article>
  `;

  document.querySelector("#detalhes").scrollIntoView({ behavior: "smooth" });
}


// =============================================
// 10. API DE COTAÇÃO (AwesomeAPI)
// =============================================
async function buscarCotacao(moeda) {
  const url = `https://economia.awesomeapi.com.br/json/last/${moeda}-BRL`;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Falha ao consultar a API de cotação");
  }

  const dados = await resposta.json();

  // A resposta vem assim: { "USDBRL": { "bid": "5.43", ... } }
  const chave = `${moeda}BRL`;
  return parseFloat(dados[chave].bid);
}

// Mostra a cotação atual assim que a pessoa escolhe a moeda
seletorMoeda.addEventListener("change", async function () {
  const moeda = seletorMoeda.value;

  if (moeda === "BRL") {
    infoCotacao.textContent = "";
    return;
  }

  infoCotacao.textContent = "Buscando cotação...";

  try {
    const cotacao = await buscarCotacao(moeda);
    infoCotacao.textContent = `Cotação atual: 1 ${moeda} = ${formatarValor(cotacao)}. O valor será salvo em reais.`;
  } catch (erro) {
    infoCotacao.textContent = "Não foi possível carregar a cotação agora.";
  }
});


// =============================================
// 11. CADASTRO E EDIÇÃO
// Capturar → Validar → Montar o objeto → Guardar → Atualizar
// =============================================
formGasto.addEventListener("submit", async function (evento) {
  evento.preventDefault(); // impede a página de recarregar

  // 1. Capturar os dados
  const descricao = document.querySelector("#descricao").value.trim();
  const valorDigitado = parseFloat(document.querySelector("#valor").value);
  const data = document.querySelector("#data").value;
  const categoria = document.querySelector("#categoria").value;
  const tipo = document.querySelector("input[name='tipo']:checked").value;
  const observacoes = document.querySelector("#observacoes").value.trim();
  const moeda = seletorMoeda.value;

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

  // 3. Se a moeda não for real, busca a cotação na API e converte
  let cotacao = 1;

  if (moeda !== "BRL") {
    btnSalvar.disabled = true;
    mostrarMensagem("Buscando cotação...", "info");

    try {
      cotacao = await buscarCotacao(moeda);
    } catch (erro) {
      mostrarMensagem("Não foi possível buscar a cotação agora. Tente novamente.", "erro");
      return;
    } finally {
      btnSalvar.disabled = false;
    }
  }

  // 4. Montar o objeto (o valor fica sempre em reais)
  const dadosGasto = {
    descricao: descricao,
    valor: Math.round(valorDigitado * cotacao * 100) / 100,
    valorOriginal: valorDigitado,
    moeda: moeda,
    cotacao: cotacao,
    data: data,
    categoria: categoria,
    tipo: tipo,
    observacoes: observacoes
  };

  // Guardar no array
  let textoSucesso = "Gasto cadastrado com sucesso!";

  if (idEmEdicao === null) {
    // Cadastro novo
    dadosGasto.id = Date.now(); // número único para identificar o gasto
    gastos.push(dadosGasto);
  } else {
    // Edição: troca o gasto antigo pelo novo, mantendo o mesmo id
    const indice = gastos.findIndex(function (gasto) {
      return gasto.id === idEmEdicao;
    });
    dadosGasto.id = idEmEdicao;
    gastos[indice] = dadosGasto;
    textoSucesso = "Gasto atualizado com sucesso!";
  }

  // Salvar e atualizar a tela
  salvarGastos();
  renderizarGastos();
  formGasto.reset();
  mostrarMensagem(textoSucesso, "sucesso");

  // Se esse gasto estava aberto nos detalhes, atualiza os detalhes também
  if (idDetalhado === dadosGasto.id) {
    mostrarDetalhes(dadosGasto.id);
  }
});

function iniciarEdicao(id) {
  const gasto = buscarGastoPorId(id);
  if (!gasto) return;

  idEmEdicao = id;

  // Preenche o formulário com os dados do gasto
  document.querySelector("#descricao").value = gasto.descricao;
  seletorMoeda.value = gasto.moeda || "BRL";
  document.querySelector("#valor").value = gasto.valorOriginal ?? gasto.valor;
  document.querySelector("#data").value = gasto.data;
  document.querySelector("#categoria").value = gasto.categoria;
  document.querySelector(`input[name='tipo'][value='${gasto.tipo}']`).checked = true;
  document.querySelector("#observacoes").value = gasto.observacoes;

  btnSalvar.textContent = "Salvar alterações";
  btnCancelar.hidden = false;
  mostrarMensagem(`Editando "${gasto.descricao}".`, "info");

  document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth" });
}

// Quando o formulário é limpo, sai do modo de edição
formGasto.addEventListener("reset", function () {
  idEmEdicao = null;
  btnSalvar.textContent = "Salvar";
  btnCancelar.hidden = true;
  infoCotacao.textContent = "";
});

btnCancelar.addEventListener("click", function () {
  formGasto.reset();
  mostrarMensagem("Edição cancelada.", "info");
});


// =============================================
// 12. EXCLUSÃO
// =============================================
function excluirGasto(id) {
  const gasto = buscarGastoPorId(id);
  if (!gasto) return;

  const confirmou = confirm(`Deseja excluir "${gasto.descricao}"?`);
  if (!confirmou) return;

  // filter cria um array novo SEM o gasto excluído
  gastos = gastos.filter(function (item) {
    return item.id !== id;
  });

  salvarGastos();
  renderizarGastos();

  // Se o gasto excluído estava sendo editado, limpa o formulário
  if (idEmEdicao === id) {
    formGasto.reset();
  }

  // Se o gasto excluído estava nos detalhes, limpa os detalhes
  if (idDetalhado === id) {
    mostrarDetalhes(null);
  }

  mostrarMensagem("Gasto excluído.", "sucesso");
}


// =============================================
// 13. CLIQUES NOS BOTÕES (Ver detalhes, Editar, Excluir)
// Um único "ouvinte" para todos os botões da tabela
// =============================================
function tratarCliqueAcoes(evento) {
  const botao = evento.target;
  if (!botao.dataset.id) return; // clicou fora de um botão

  const id = Number(botao.dataset.id);

  if (botao.classList.contains("btn-excluir")) {
    excluirGasto(id);
  }
  if (botao.classList.contains("btn-editar")) {
    iniciarEdicao(id);
  }
  if (botao.classList.contains("btn-detalhes")) {
    mostrarDetalhes(id);
  }
}

listaGastos.addEventListener("click", tratarCliqueAcoes);
detalheGasto.addEventListener("click", tratarCliqueAcoes);


// =============================================
// 14. EVENTOS DE PESQUISA, FILTRO E ORDENAÇÃO
// Qualquer mudança redesenha a tabela
// =============================================
campoPesquisa.addEventListener("input", renderizarGastos);
filtroCategoria.addEventListener("change", renderizarGastos);
filtroTipo.addEventListener("change", renderizarGastos);
ordenacao.addEventListener("change", renderizarGastos);

// Impede que apertar Enter na pesquisa recarregue a página
formPesquisa.addEventListener("submit", function (evento) {
  evento.preventDefault();
});


// =============================================
// INÍCIO: desenha a tabela assim que a página carrega
// =============================================
renderizarGastos();