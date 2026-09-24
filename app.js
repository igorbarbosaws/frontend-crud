const API_URL = "https://backend-crud-jgzt.onrender.com/funcionarios";

const formulario = document.querySelector("#form-funcionario");
const campoId = document.querySelector("#funcionario-id");
const campoNome = document.querySelector("#nome");
const campoEmail = document.querySelector("#email");
const campoIdade = document.querySelector("#idade");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaFuncionariosEl = document.querySelector("#lista-funcionarios");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function criarCartaoFuncionario(funcionario) {
  const cartao = document.createElement("article");
  cartao.className = "funcionario";

  const nome = document.createElement("h3");
  nome.textContent = funcionario.nome;

  const email = document.createElement("p");
  email.textContent = `E-mail: ${funcionario.email}`;

  const idade = document.createElement("p");
  idade.textContent = `Idade: ${funcionario.idade ?? "Não informada"}`;

  const id = document.createElement("p");
  id.textContent = `ID: ${funcionario._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-funcionario";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarFuncionarioParaEdicao(funcionario._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirFuncionario(funcionario._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(nome, email, idade, id, acoes);

  return cartao;
}

function exibirFuncionarios(funcionarios) {
  listaFuncionariosEl.innerHTML = "";

  if (funcionarios.length === 0) {
    mostrarMensagem("Nenhum funcionário cadastrado");
    return;
  }

  funcionarios.forEach((funcionario) => {
    listaFuncionariosEl.appendChild(criarCartaoFuncionario(funcionario));
  });

  mostrarMensagem(`${funcionarios.length} funcionário(s) encontrado(s)`);
}

async function listarFuncionarios() {
  try {
    mostrarMensagem("Carregando funcionários...");
    const funcionarios = await fazerRequisicao(API_URL);
    exibirFuncionarios(funcionarios);
  } catch (erro) {
    listaFuncionariosEl.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarFuncionarioPorId(id) {
  const funcionario = await fazerRequisicao(`${API_URL}/${id}`);
  exibirFuncionarios([funcionario]);
  return funcionario;
}

async function salvarFuncionario(evento) {
  evento.preventDefault();

  const funcionario = {
    nome: campoNome.value.trim(),
    email: campoEmail.value.trim(),
    idade: campoIdade.value.trim()
  };

  if (campoIdade.value !== "") {
    funcionario.idade = Number(campoIdade.value);
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(funcionario)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Funcionário atualizado" : "Funcionário cadastrado");
    await listarFuncionarios();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarFuncionarioParaEdicao(id) {
  try {
    const funcionario = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = funcionario._id;
    campoNome.value = funcionario.nome;
    campoEmail.value = funcionario.email;
    campoIdade.value = funcionario.idade ?? "";
    tituloFormulario.textContent = "Editar funcionário";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoNome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirFuncionario(id) {
  const confirmou = window.confirm("Deseja excluir este funcionário?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Funcionário excluído");
    await listarFuncionarios();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Novo funcionário";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarFuncionario);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarFuncionarios);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarFuncionarios();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarFuncionarioPorId(id);
  } catch (erro) {
    listaFuncionariosEl.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarFuncionarios();
