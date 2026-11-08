// =============================================
// BLOCO 1: DADOS DA APLICAÇÃO
// Cada gasto é um objeto. Todos ficam num array.
// =============================================
let gastos = [
  { id: 1, descricao: "Almoço no restaurante", valor: 35, data: "2026-10-01", categoria: "alimentacao", tipo: "despesa", observacoes: "Almoço com a turma da faculdade." },
  { id: 2, descricao: "Passagem de ônibus", valor: 5.5, data: "2026-10-02", categoria: "transporte", tipo: "despesa", observacoes: "" },
  { id: 3, descricao: "Mesada", valor: 200, data: "2026-10-03", categoria: "outros", tipo: "receita", observacoes: "" }
];

// =============================================
// BLOCO 2: ELEMENTOS DO HTML
// =============================================
const listaGastos = document.querySelector("#lista-gastos");

// =============================================
// BLOCO 3: FUNÇÕES DE FORMATAÇÃO
// Traduzem o dado salvo para o texto da tela.
// =============================================
const nomesCategorias = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  moradia: "Moradia",
  lazer: "Lazer",
  estudos: "Estudos",
  saude: "Saúde",
  outros: "Outros"
};

function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

// =============================================
// BLOCO 4: LISTAGEM DINÂMICA
// Cria uma linha <tr> para cada gasto do array.
// =============================================
function renderizarGastos() {
  listaGastos.innerHTML = ""; // limpa a tabela antes de desenhar

  for (const gasto of gastos) {
    const linha = document.createElement("tr");

    const tipoTexto = gasto.tipo === "despesa" ? "Despesa" : "Receita";

    linha.innerHTML = `
      <td>${gasto.descricao}</td>
      <td>${nomesCategorias[gasto.categoria]}</td>
      <td>${tipoTexto}</td>
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
// BLOCO 5: ELEMENTOS DO CADASTRO
// =============================================
const formGasto = document.querySelector("#form-gasto");
const mensagem = document.querySelector("#mensagem");

// =============================================
// BLOCO 6: FEEDBACK AO USUÁRIO
// =============================================
function mostrarMensagem(texto, tipo) {
  mensagem.textContent = texto;
  mensagem.className = tipo; // "sucesso" ou "erro"
}

// =============================================
// BLOCO 7: CADASTRO
// Capturar → Validar → Criar e guardar → Atualizar
// =============================================
formGasto.addEventListener("submit", function (evento) {
  evento.preventDefault(); // impede a página de recarregar

  // 1. Capturar os dados
  const descricao = document.querySelector("#descricao").value.trim();
  const valor = parseFloat(document.querySelector("#valor").value);
  const data = document.querySelector("#data").value;
  const categoria = document.querySelector("#categoria").value;
  const tipo = document.querySelector("input[name='tipo']:checked").value;
  const observacoes = document.querySelector("#observacoes").value.trim();

  // 2. Validar
  if (descricao.length < 3) {
    mostrarMensagem("A descrição precisa ter pelo menos 3 letras.", "erro");
    return;
  }
  if (isNaN(valor) || valor <= 0) {
    mostrarMensagem("Informe um valor maior que zero.", "erro");
    return;
  }
  if (data === "" || categoria === "") {
    mostrarMensagem("Preencha a data e a categoria.", "erro");
    return;
  }

  // 3. Criar o objeto e adicionar no array
  const novoGasto = {
    id: Date.now(),
    descricao,
    valor,
    data,
    categoria,
    tipo,
    observacoes
  };
  gastos.push(novoGasto);

  // 4. Atualizar a tela
  renderizarGastos();
  formGasto.reset();
  mostrarMensagem("Gasto cadastrado com sucesso!", "sucesso");
});

// Desenha a tabela assim que a página carrega
renderizarGastos();