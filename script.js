/* =========================================================
   NEUROMETRIC — script.js
   Todo o funcionamento do site está neste arquivo:
   banco de questões, navegação, cronômetros, respostas,
   resultados, gráficos e botões.
   ========================================================= */


/* ---------------------------------------------------------
   1. CONFIGURAÇÕES (altere aqui os contatos verdadeiros)
   --------------------------------------------------------- */
const CONFIG = {
  // Endereço completo do perfil no Instagram.
  instagramUrl: "https://www.instagram.com/instafacens/",

  // Número do WhatsApp: 55 + DDD + número, só dígitos. Ex.: "5515999998888"
  whatsappNumero: "5515988104797",

  // Mensagem que aparece preenchida ao abrir o WhatsApp.
  whatsappMensagem: "Olá! Gostaria de saber mais sobre o NeuroMetric."
};

// Parâmetros da fórmula do QI estimado (explicada na seção 14).
const CONFIG_QI = {
  bonusMaximo: 0.20,      // até +20% de pontos por responder rápido
  tempoLimite: 60,        // a partir de 60 s na questão, o bônus de rapidez é zero
  penalidadeErro: 0.25,   // cada erro desconta 1/4 de ponto (correção de "chute" com 5 alternativas)

  // Grupo de referência: média e desvio-padrão do percentual de pontos.
  // Calibrado em 26/10/2026 com 22 participantes (primeiras tentativas).
  mediaReferencia: 56.4,  // percentual médio de pontos do grupo
  desvioReferencia: 17.2, // desvio-padrão do percentual de pontos do grupo

  qiMinimo: 55,           // menor QI exibido
  qiMaximo: 150           // QI de quem faz 100% dos pontos (máximo possível)
};


/* ---------------------------------------------------------
   2. BANCO COM AS 34 QUESTÕES
   - "correta" é o ÍNDICE da alternativa certa:
     0 = A, 1 = B, 2 = C, 3 = D, 4 = E
   - "imagem" é a figura principal (ou null quando não existe)
   - "imagensAlternativas" são as figuras das alternativas
   - "sequencia", "grade" e "cartoes" são elementos visuais
     extras que existiam no design original
   --------------------------------------------------------- */

// Pequena função que monta os 5 caminhos das imagens das alternativas.
// Exemplo: imagensDaQuestao(7) -> ["imagens/imagens_das_alternativas/Q7_A.png", ... "Q7_E.png"]
function imagensDaQuestao(numero) {
  return ["A", "B", "C", "D", "E"].map(function (letra) {
    return "imagens/imagens_das_alternativas/Q" + numero + "_" + letra + ".png";
  });
}

// Texto das alternativas das questões visuais
const FIGURAS = ["Figura A", "Figura B", "Figura C", "Figura D", "Figura E"];

const questoes = [
  {
    numero: 1, categoria: "Raciocínio Dedutivo",
    enunciado: "Um fazendeiro tem 50 galinhas. Todas morrem, menos 37. Quantas sobram?",
    alternativas: ["23", "20", "30", "13", "37"],
    correta: 4,
    explicacao: "\"Todas morrem, menos 37\" significa que 37 galinhas continuam vivas.",
    imagem: "imagens/Q1.png"
  },
  {
    numero: 2, categoria: "Raciocínio Dedutivo",
    enunciado: "Joana está em uma competição de natação e ultrapassa a pessoa em 2º lugar. Em que lugar Joana está?",
    alternativas: ["1º lugar", "2º lugar", "3º lugar", "4º lugar", "5º lugar"],
    correta: 1,
    explicacao: "Quem ultrapassa o 2º colocado ocupa a posição dele: Joana passa a estar em 2º lugar.",
    imagem: "imagens/Q2.png"
  },
  {
    numero: 3, categoria: "Raciocínio Espacial",
    enunciado: "Quantos vértices tem uma pirâmide quadrangular equilátera?",
    alternativas: ["3", "4", "5", "6", "8"],
    correta: 2,
    explicacao: "A base quadrada tem 4 vértices e o topo (ápice) é mais 1: total de 5 vértices.",
    imagem: "imagens/Q3.png"
  },
  {
    numero: 4, categoria: "Sequências Numéricas",
    enunciado: "Qual é o próximo número desta sequência?",
    sequencia: ["3", "6", "12", "24", "?"],
    alternativas: ["48", "36", "16", "64", "92"],
    correta: 0,
    explicacao: "Cada número é o dobro do anterior: 24 × 2 = 48.",
    imagem: null
  },
  {
    numero: 5, categoria: "Sequências Numéricas",
    enunciado: "Qual número está faltando?",
    sequencia: ["6", "12", "18", "24", "?", "36"],
    alternativas: ["28", "32", "34", "30", "36"],
    correta: 3,
    explicacao: "A sequência aumenta de 6 em 6: 24 + 6 = 30 (e 30 + 6 = 36).",
    imagem: null
  },
  {
    numero: 6, categoria: "Memória de Trabalho",
    enunciado: "Qual era o 4º dígito da sequência mostrada anteriormente?",
    descricao: "Selecione a única alternativa correta com base na sua recordação imediata.",
    alternativas: ["9", "3", "7", "2", "1"],
    correta: 0,
    explicacao: "A sequência memorizada após a Questão 3 foi 2 3 1 9 7. O 4º dígito é 9.",
    imagem: null
  },
  {
    numero: 7, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual célula completa a grade?",
    alternativas: FIGURAS,
    correta: 1,
    explicacao: "A figura B mantém o mesmo tamanho de célula e a mesma espessura de linha da grade (cerca de 7 colunas por 6 linhas no espaço azul).",
    imagem: "imagens/Q7.png",
    imagensAlternativas: imagensDaQuestao(7)
  },
  {
    numero: 8, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura completa a imagem?",
    alternativas: FIGURAS,
    correta: 2,
    explicacao: "A figura C mantém a inclinação, o tamanho e o espaçamento diagonal das cruzes, e continua a cruz que aparece cortada no canto superior direito.",
    imagem: "imagens/Q8.png",
    imagensAlternativas: imagensDaQuestao(8)
  },
  {
    numero: 9, categoria: "Raciocínio Lógico / Padrões Numéricos",
    enunciado: "Qual figura continua a rotação?",
    grade: ["2", "4", "6", "4", "6", "8", "6", "8", "?"],
    alternativas: ["4", "6", "8", "10", "12"],
    correta: 3,
    explicacao: "Em cada linha e em cada coluna os números aumentam de 2 em 2: 6, 8, 10.",
    imagem: null
  },
  {
    numero: 10, categoria: "Memória de Trabalho",
    enunciado: "Qual era o 5º dígito?",
    alternativas: ["4", "9", "3", "6", "8"],
    correta: 4,
    explicacao: "A sequência memorizada após a Questão 6 foi 9 6 2 0 8 4. O 5º dígito é 8.",
    imagem: null
  },
  {
    numero: 11, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura mantém a alternância?",
    alternativas: FIGURAS,
    correta: 0,
    explicacao: "Todos os losangos têm um ponto no centro. A figura A mostra a metade inferior dos dois losangos cobertos, com o ponto central no lugar certo e as pontas da linha de baixo.",
    imagem: "imagens/Q11.png",
    imagensAlternativas: imagensDaQuestao(11)
  },
  {
    numero: 12, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual célula completa a grade?",
    descricao: "Analise a progressão lógica das linhas e colunas para identificar o elemento correspondente ao espaço em azul.",
    alternativas: FIGURAS,
    correta: 2,
    explicacao: "As linhas da grade são acrescentadas ou alteradas de acordo com a progressão estabelecida, correspondendo ao padrão sistemático.",
    imagem: "imagens/Q12.svg",
    imagensAlternativas: imagensDaQuestao(12)
  },
  {
    numero: 13, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura continua a rotação?",
    alternativas: FIGURAS,
    correta: 4,
    explicacao: "Na figura E, cada raio de luz encaixa com o trecho visível à esquerda e à direita do espaço azul, abrindo-se em leque a partir da lanterna.",
    imagem: "imagens/Q13.png",
    imagensAlternativas: imagensDaQuestao(13)
  },
  {
    numero: 14, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura continua a progressão?",
    alternativas: FIGURAS,
    correta: 3,
    explicacao: "As duas ondas que entram no espaço azul sobem da esquerda para a direita. Só a figura D liga as duas curvas sem quebras.",
    imagem: "imagens/Q14.png",
    imagensAlternativas: imagensDaQuestao(14)
  },
  {
    numero: 15, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura continua o movimento?",
    alternativas: FIGURAS,
    correta: 4,
    explicacao: "Na linha de cima, a fileira inferior troca de lado; na linha de baixo, a fileira superior troca de lado. A figura E é o espelho da figura da direita (quadrado preto à esquerda, branco à direita).",
    imagem: "imagens/Q15.png",
    imagensAlternativas: imagensDaQuestao(15)
  },
  {
    numero: 16, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura mantém a alternância?",
    alternativas: FIGURAS,
    correta: 4,
    explicacao: "Na coluna da direita o quarto de círculo passa de baixo para cima; na coluna da esquerda o retângulo faz o caminho inverso. O retângulo deve ficar no canto inferior direito (figura E).",
    imagem: "imagens/Q16.png",
    imagensAlternativas: imagensDaQuestao(16)
  },
  {
    numero: 17, categoria: "Raciocínio Visual / Rotação de Figuras",
    enunciado: "Qual figura continua a rotação?",
    alternativas: FIGURAS,
    correta: 2,
    explicacao: "A primeira coluna se repete nas duas linhas; por isso, a segunda coluna também se repete: o pássaro espelhado, igual ao da linha de cima (figura C).",
    imagem: "imagens/Q17.png",
    imagensAlternativas: imagensDaQuestao(17)
  },
  {
    numero: 18, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura continua a progressão?",
    alternativas: FIGURAS,
    correta: 1,
    explicacao: "A linha de cima tem nariz triangular; a coluna da direita tem rosto quadrado. A resposta é o rosto quadrado com nariz triangular (figura B).",
    imagem: "imagens/Q18.png",
    imagensAlternativas: imagensDaQuestao(18)
  },
  {
    numero: 19, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual figura continua a transformação?",
    descricao: "Analise a sequência de rotação, subdivisões ortogonais e padrão volumétrico nas matrizes para determinar a figura correspondente.",
    alternativas: FIGURAS,
    correta: 0,
    explicacao: "Cada coluna acrescenta listras (face direita e depois topo) e cada linha acrescenta listras (face esquerda e depois topo). No último cubo o topo recebe listras nas duas direções (quadriculado) e as faces laterais ficam listradas (figura A).",
    imagem: "imagens/Q19.png",
    imagensAlternativas: imagensDaQuestao(19)
  },
  {
    numero: 20, categoria: "Raciocínio Visual / Padrões e Matrizes",
    enunciado: "Qual opção continua a contagem?",
    alternativas: FIGURAS,
    correta: 2,
    explicacao: "Em cada linha, um ponto do topo é retirado a cada coluna (primeiro o do canto superior esquerdo, depois o do topo). O dado final fica com 4 pontos: centro, centro-direita e os dois de baixo (figura C).",
    imagem: "imagens/Q20.png",
    imagensAlternativas: imagensDaQuestao(20)
  },
  {
    numero: 21, categoria: "Sequências Numéricas",
    enunciado: "Qual número completa a sequência?",
    sequencia: ["4", "12", "36", "108", "324", "?"],
    alternativas: ["970", "972", "975", "324", "1944"],
    correta: 1,
    explicacao: "Cada termo é o anterior multiplicado por 3: 324 × 3 = 972.",
    imagem: null
  },
  {
    numero: 22, categoria: "Sequências Numéricas",
    enunciado: "Qual número completa a sequência?",
    sequencia: ["2", "7", "10", "15", "18", "?"],
    alternativas: ["23", "24", "20", "18", "26"],
    correta: 0,
    explicacao: "Os saltos alternam +5 e +3: 2 → 7 → 10 → 15 → 18 → 23.",
    imagem: null
  },
  {
    numero: 23, categoria: "Lógica Dedutiva",
    enunciado: "Um prêmio está escondido em uma das três caixas (A, B ou C). Cada caixa tem uma inscrição, e apenas uma das inscrições é verdadeira.",
    cartoes: [
      { letra: "A", titulo: "Inscrição Caixa A", sub: "", texto: "\"Prêmio não está aqui\"" },
      { letra: "B", titulo: "Inscrição Caixa B", sub: "", texto: "\"O prêmio está na Caixa A\"" },
      { letra: "C", titulo: "Inscrição Caixa C", sub: "", texto: "\"O prêmio não está aqui\"" }
    ],
    perguntaFinal: "Em qual caixa está o prêmio?",
    alternativas: [
      "Devido à segunda afirmação, está na caixa A.",
      "Devido à primeira afirmação, está na caixa B.",
      "Devido à terceira afirmação, está na caixa B.",
      "Devido à primeira e à segunda afirmação, está na caixa C.",
      "Devido à primeira e à terceira afirmação, está na caixa B."
    ],
    correta: 3,
    explicacao: "Se o prêmio estivesse em A ou em B, duas inscrições seriam verdadeiras. Com o prêmio em C, só a inscrição da caixa A é verdadeira — a única opção que respeita a regra.",
    imagem: null
  },
  {
    numero: 24, categoria: "Analogias Verbais",
    enunciado: "Termômetro está para temperatura, assim como odômetro está para:",
    descricao: "Selecione a alternativa que completa a relação lógica com exatidão.",
    alternativas: ["Velocidade", "Pressão", "Empuxo", "Peso", "Distância"],
    correta: 4,
    explicacao: "O termômetro mede temperatura; o odômetro mede a distância percorrida.",
    imagem: null
  },
  {
    numero: 25, categoria: "Classificação",
    enunciado: "Qual elemento não pertence ao mesmo grupo dos demais?",
    descricao: "Selecione a alternativa correspondente à regra lógica do conjunto geométrico.",
    alternativas: ["Triângulo", "Heptágono", "Pentágono", "Hexágono", "Eneágono"],
    correta: 3,
    explicacao: "Triângulo (3), pentágono (5), heptágono (7) e eneágono (9) têm número ímpar de lados. O hexágono tem 6 lados (par).",
    imagem: null
  },
  {
    numero: 26, categoria: "Raciocínio Quantitativo",
    enunciado: "Quanto é 25% de 1286?",
    descricao: "Selecione uma única alternativa que apresente o cálculo exato.",
    alternativas: ["214,33", "321,5", "225,5", "345,25", "428,67"],
    correta: 1,
    explicacao: "25% é a quarta parte: 1286 ÷ 4 = 321,5.",
    imagem: null
  },
  {
    numero: 27, categoria: "Lógica Dedutiva",
    enunciado: "Todos os B são E. Nenhum E é C. Qual conclusão é necessariamente verdadeira?",
    alternativas: ["Nenhum E é B", "Todos os E são B", "Nenhum B é C", "Todos os C são B", "Alguns B são C"],
    correta: 2,
    explicacao: "Todo B está dentro de E, e E não tem nenhum elemento em comum com C. Logo, nenhum B é C.",
    imagem: null
  },
  {
    numero: 28, categoria: "Raciocínio Espacial",
    enunciado: "Uma folha é dobrada ao meio verticalmente, e depois dobrada ao meio novamente. Um furo é feito longe da dobra. Ao abrir, quantos furos simétricos aparecem?",
    descricao: "Selecione a opção que responde corretamente à dedução espacial.",
    alternativas: ["1", "2", "8", "4", "3"],
    correta: 3,
    explicacao: "Duas dobras formam 4 camadas de papel. Um furo atravessa as 4 camadas, gerando 4 furos.",
    imagem: null
  },
  {
    numero: 29, categoria: "Analogias Verbais",
    enunciado: "A pintura é para o pincel o que o(a) ___________ é para os instrumentos.",
    descricao: "Selecione a alternativa que preenche a analogia com exatidão.",
    alternativas: ["Partitura", "Pensamento", "Melodia", "Sentimento", "Música"],
    correta: 4,
    explicacao: "O pincel é a ferramenta que produz a pintura; os instrumentos são as ferramentas que produzem a música.",
    imagem: null
  },
  {
    numero: 30, categoria: "Analogias Verbais",
    enunciado: "Epílogo está para romance assim como:",
    descricao: "Selecione a alternativa correspondente à relação funcional.",
    alternativas: ["Conclusão está para ensaio", "Prefácio está para enciclopédia", "Prólogo está para peça", "Dois pontos está para música", "X está para matemática"],
    correta: 0,
    explicacao: "O epílogo é a parte final de um romance; a conclusão é a parte final de um ensaio.",
    imagem: null
  },
  {
    numero: 31, categoria: "Sequências Numéricas",
    enunciado: "Qual número completa a sequência?",
    descricao: "Identifique a regra que rege o avanço dos termos e selecione a alternativa correspondente.",
    sequencia: ["4", "5", "8", "13", "20", "?"],
    alternativas: ["29", "31", "33", "27", "25"],
    correta: 0,
    explicacao: "As diferenças são os números ímpares: +1, +3, +5, +7, +9. Logo, 20 + 9 = 29.",
    imagem: null
  },
  {
    numero: 32, categoria: "Orientação Espacial",
    enunciado: "Você está voltada para o norte, gira 90° à direita e depois 180°. Para onde está voltada?",
    descricao: "Determine a orientação direcional final com base nas rotações descritas.",
    sequencia: ["Início: N (0°)", "+90° dir", "+180°"],
    sequenciaPequena: true,
    alternativas: ["Sudeste", "Norte", "Oeste", "Leste", "Sul"],
    correta: 2,
    explicacao: "Norte + 90° à direita = Leste. Leste + 180° = Oeste.",
    imagem: null
  },
  {
    numero: 33, categoria: "Analogias Verbais",
    enunciado: "Ouro está para maleável assim como:",
    descricao: "Selecione a opção que apresenta a mesma propriedade característica.",
    alternativas: ["Vidro está para transparente", "Diamante está para duro", "Água está para líquida", "Gás está para invisível", "Prata está para brilhante"],
    correta: 1,
    explicacao: "A maleabilidade é a propriedade física marcante do ouro, assim como a dureza é a propriedade marcante do diamante.",
    imagem: null
  },
  {
    numero: 34, categoria: "Lógica Dedutiva",
    enunciado: "Quatro irmãos (Edu, Rui, Noé e Leo) são suspeitos de quebrar um vaso. Ao serem interrogados, eles dão os seguintes depoimentos. Sabe-se que apenas um deles está falando a verdade:",
    cartoes: [
      { letra: "E", titulo: "Edu", sub: "Suspeito 1", texto: "\"Rui quebrou o vaso\"" },
      { letra: "R", titulo: "Rui", sub: "Suspeito 2", texto: "\"Noé quebrou o vaso\"" },
      { letra: "N", titulo: "Noé", sub: "Suspeito 3", texto: "\"Rui está mentindo\"" },
      { letra: "L", titulo: "Leo", sub: "Suspeito 4", texto: "\"Não fui eu\"" }
    ],
    perguntaFinal: "Quem quebrou o vaso?",
    alternativas: [
      "Edu está falando a verdade, Rui quebrou o vaso.",
      "Rui está falando a verdade, Noé quebrou o vaso.",
      "Noé está falando a verdade, Leo quebrou o vaso.",
      "Leo está falando a verdade, Edu quebrou o vaso.",
      "Noé está falando a verdade, Edu quebrou o vaso."
    ],
    correta: 2,
    explicacao: "Rui e Noé se contradizem, então um deles diz a verdade. Assim, Edu e Leo mentem. Se Leo mente (\"Não fui eu\"), foi Leo. Então Rui mente e Noé é o único que diz a verdade.",
    imagem: null
  }
];

// Telas de memorização: aparecem DEPOIS da questão com este número.
const memorizacoes = {
  3:  { titulo: "Memorize esta sequência numérica", itens: ["2", "3", "1", "9", "7"] },
  6:  { titulo: "Memorize esta sequência numérica", itens: ["9", "6", "2", "0", "8", "4"] }
};

const LETRAS = ["A", "B", "C", "D", "E"];
const TOTAL = questoes.length; // 34


/* ---------------------------------------------------------
   3. VARIÁVEIS DE CONTROLE DO TESTE
   --------------------------------------------------------- */
let questaoAtual = 0;          // índice da questão na tela (0 a 33)
let alternativaEscolhida = null; // índice escolhido na questão atual
let respostasUsuario = [];     // registro de todas as respostas

let inicioTeste = null;        // momento (Date.now) em que o teste começou
let inicioQuestao = null;      // momento em que a questão atual apareceu
let tempoTotalSegundos = 0;    // preenchido ao finalizar
let intervaloCronometro = null; // guarda o setInterval
let graficos = [];             // gráficos criados (para apagar ao reiniciar)


/* ---------------------------------------------------------
   4. ATALHOS PARA OS ELEMENTOS DO HTML
   --------------------------------------------------------- */
function el(id) { return document.getElementById(id); }

function mostrar(elemento) { elemento.classList.remove("escondido"); }
function esconder(elemento) { elemento.classList.add("escondido"); }

// Reinicia a animação de "fade" de um elemento
function animar(elemento) {
  elemento.classList.remove("animar");
  void elemento.offsetWidth; // força o navegador a reiniciar a animação
  elemento.classList.add("animar");
}


/* ---------------------------------------------------------
   5. FORMATAÇÃO DE TEMPO
   --------------------------------------------------------- */
function doisDigitos(n) { return String(n).padStart(2, "0"); }

// 75 -> "01:15"
function formatarMinSeg(segundos) {
  segundos = Math.floor(segundos);
  return doisDigitos(Math.floor(segundos / 60)) + ":" + doisDigitos(segundos % 60);
}

// 3725 -> "01:02:05"
function formatarHoraMinSeg(segundos) {
  segundos = Math.floor(segundos);
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  return doisDigitos(h) + ":" + doisDigitos(m) + ":" + doisDigitos(segundos % 60);
}

// 125 -> "2min 05s" | 42.5 -> "42,5s"
function formatarTexto(segundos) {
  if (segundos >= 60) {
    const s = Math.round(segundos);
    return Math.floor(s / 60) + "min " + doisDigitos(s % 60) + "s";
  }
  return numeroBR(segundos, 1) + "s";
}

// Número com vírgula (padrão brasileiro): 2.9411 -> "2,94"
function numeroBR(valor, casas) {
  return valor.toFixed(casas).replace(".", ",");
}


/* ---------------------------------------------------------
   6. CRONÔMETROS (Date.now + setInterval)
   --------------------------------------------------------- */
function iniciarCronometro() {
  inicioTeste = Date.now();
  pararCronometro(); // evita dois intervalos ao mesmo tempo
  intervaloCronometro = setInterval(atualizarCronometros, 1000);
  atualizarCronometros();
}

function atualizarCronometros() {
  // Tempo total: conta desde o "Iniciar Quiz" (inclusive nas memorizações)
  const total = (Date.now() - inicioTeste) / 1000;
  el("tempo-total").textContent = formatarHoraMinSeg(total);

  // Tempo da questão: só conta enquanto uma questão está na tela
  if (inicioQuestao !== null) {
    el("tempo-questao").textContent = formatarMinSeg((Date.now() - inicioQuestao) / 1000);
  } else {
    el("tempo-questao").textContent = "00:00";
  }
}

function pararCronometro() {
  if (intervaloCronometro !== null) {
    clearInterval(intervaloCronometro);
    intervaloCronometro = null;
  }
}


/* ---------------------------------------------------------
   7. INICIAR O TESTE
   --------------------------------------------------------- */
function iniciarTeste() {
  // Zera tudo de uma tentativa anterior
  questaoAtual = 0;
  alternativaEscolhida = null;
  respostasUsuario = [];
  tempoTotalSegundos = 0;

  esconder(el("tela-inicial"));
  esconder(el("tela-resultados"));
  esconder(el("rodape"));
  mostrar(el("tela-quiz"));
  mostrar(el("cronometros"));

  iniciarCronometro();
  mostrarQuestao();
  window.scrollTo(0, 0);
}


/* ---------------------------------------------------------
   8. MOSTRAR A QUESTÃO ATUAL (um único modelo para as 34)
   --------------------------------------------------------- */
function mostrarQuestao() {
  const questao = questoes[questaoAtual];
  alternativaEscolhida = null;

  // Número, ID e categoria
  el("numero-questao").textContent = "Questão " + questao.numero + " de " + TOTAL;
  el("categoria-questao").textContent = "• " + questao.categoria;
  el("id-questao").textContent = "ID: NM-" + doisDigitos(questao.numero);

  // Enunciado e descrição
  el("enunciado").textContent = questao.numero + " — " + questao.enunciado;
  if (questao.descricao) {
    el("descricao").textContent = questao.descricao;
    mostrar(el("descricao"));
  } else {
    esconder(el("descricao"));
  }

  // Imagem principal
  if (questao.imagem) {
    el("imagem-questao").src = questao.imagem;
    el("imagem-questao").alt = "Imagem da Questão " + questao.numero;
    mostrar(el("area-imagem"));
  } else {
    el("imagem-questao").removeAttribute("src");
    esconder(el("area-imagem"));
  }

  // Elementos extras (sequência, grade, cartões)
  montarExtras(questao);

  // Alternativas
  montarAlternativas(questao);

  // Botão: desabilitado até escolher; texto muda na última questão
  el("botao-proxima").disabled = true;
  el("texto-botao-proxima").textContent =
    (questaoAtual === TOTAL - 1) ? "Finalizar teste" : "Próxima questão";

  atualizarProgresso();

  // Cronômetro da questão começa em 00:00
  inicioQuestao = Date.now();
  atualizarCronometros();

  animar(el("cartao-questao"));
}

// Cria sequências, grade numérica ou cartões de afirmações
function montarExtras(questao) {
  const area = el("area-extra");
  area.innerHTML = "";

  if (questao.sequencia) {
    const caixa = document.createElement("div");
    caixa.className = "sequencia";
    questao.sequencia.forEach(function (valor, i) {
      if (i > 0) {
        const seta = document.createElement("span");
        seta.className = "seta-seq";
        seta.textContent = "→";
        caixa.appendChild(seta);
      }
      const chip = document.createElement("span");
      chip.className = "chip";
      if (valor === "?") chip.classList.add("interrogacao");
      if (questao.sequenciaPequena) chip.classList.add("pequeno");
      chip.textContent = valor;
      caixa.appendChild(chip);
    });
    area.appendChild(caixa);
  }

  if (questao.grade) {
    const grade = document.createElement("div");
    grade.className = "grade";
    questao.grade.forEach(function (valor) {
      const chip = document.createElement("span");
      chip.className = "chip" + (valor === "?" ? " interrogacao" : "");
      chip.textContent = valor;
      grade.appendChild(chip);
    });
    area.appendChild(grade);
  }

  if (questao.cartoes) {
    const lista = document.createElement("div");
    lista.className = "afirmacoes";
    questao.cartoes.forEach(function (c) {
      const cartao = document.createElement("div");
      cartao.className = "afirmacao";
      cartao.innerHTML =
        '<div class="afirmacao-topo"><span class="afirmacao-letra"></span>' +
        '<div><div class="afirmacao-titulo"></div><div class="afirmacao-sub"></div></div></div>' +
        '<div class="afirmacao-texto"></div>';
      cartao.querySelector(".afirmacao-letra").textContent = c.letra;
      cartao.querySelector(".afirmacao-titulo").textContent = c.titulo;
      cartao.querySelector(".afirmacao-sub").textContent = c.sub;
      cartao.querySelector(".afirmacao-texto").textContent = c.texto;
      lista.appendChild(cartao);
    });
    area.appendChild(lista);

    const pergunta = document.createElement("p");
    pergunta.className = "pergunta-final";
    pergunta.textContent = questao.perguntaFinal;
    area.appendChild(pergunta);
  }

  if (area.children.length > 0) mostrar(area); else esconder(area);
}

// Cria os 5 botões de alternativa (texto ou imagem)
function montarAlternativas(questao) {
  const lista = el("alternativas");
  lista.innerHTML = "";

  const temImagens = Boolean(questao.imagensAlternativas);
  lista.classList.toggle("com-imagens", temImagens);
  el("rotulo-alternativas").textContent = temImagens ? "Alternativas disponíveis — selecione uma opção" : "Alternativas de resposta";

  questao.alternativas.forEach(function (texto, indice) {
    // O cartão inteiro é um botão, então qualquer parte dele é clicável
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "alternativa";
    botao.setAttribute("aria-label", "Alternativa " + LETRAS[indice] + ": " + texto);

    if (temImagens) {
      botao.innerHTML = '<span class="letra"></span><img alt=""><span class="circulo"></span>';
      botao.querySelector("img").src = questao.imagensAlternativas[indice];
      botao.querySelector("img").alt = "Alternativa " + LETRAS[indice];
    } else {
      botao.innerHTML =
        '<span class="alternativa-esquerda"><span class="letra"></span><span class="texto-alternativa"></span></span>' +
        '<span class="circulo"></span>';
      botao.querySelector(".texto-alternativa").textContent = texto;
    }
    botao.querySelector(".letra").textContent = LETRAS[indice];

    botao.addEventListener("click", function () {
      selecionarAlternativa(indice);
    });
    lista.appendChild(botao);
  });
}


/* ---------------------------------------------------------
   9. SELECIONAR UMA ALTERNATIVA
   --------------------------------------------------------- */
function selecionarAlternativa(indice) {
  alternativaEscolhida = indice;

  // Só uma alternativa fica marcada
  const botoes = el("alternativas").querySelectorAll(".alternativa");
  botoes.forEach(function (botao, i) {
    botao.classList.toggle("selecionada", i === indice);
  });

  // Agora o usuário pode avançar
  el("botao-proxima").disabled = false;
}


/* ---------------------------------------------------------
   10. BARRA DE PROGRESSO
   --------------------------------------------------------- */
function atualizarProgresso() {
  const porcentagem = ((questaoAtual + 1) / TOTAL) * 100;
  el("porcentagem").textContent = numeroBR(porcentagem, 2) + "% concluído";
  el("barra-preenchida").style.width = porcentagem + "%";
  el("questoes-restantes").textContent = "Questões restantes: " + (TOTAL - questaoAtual - 1);
}


/* ---------------------------------------------------------
   11. REGISTRAR A RESPOSTA
   --------------------------------------------------------- */
function salvarResposta(numero, selecionada, correta, tempo) {
  respostasUsuario.push({
    numero: numero,
    selecionada: selecionada,
    correta: correta,
    acertou: selecionada === correta,
    tempo: tempo // em segundos
  });
}


/* ---------------------------------------------------------
   12. AVANÇAR PARA A PRÓXIMA QUESTÃO
   --------------------------------------------------------- */
function proximaQuestao() {
  if (alternativaEscolhida === null) return; // segurança extra

  const questao = questoes[questaoAtual];

  // Para o cronômetro da questão e guarda o tempo (1 casa decimal)
  const tempo = Math.round((Date.now() - inicioQuestao) / 100) / 10;
  inicioQuestao = null;

  salvarResposta(questao.numero, alternativaEscolhida, questao.correta, tempo);

  // Última questão? Então finaliza
  if (questaoAtual === TOTAL - 1) {
    finalizarTeste();
    return;
  }

  questaoAtual++;

  // Existe tela de memorização depois desta questão?
  if (memorizacoes[questao.numero]) {
    mostrarMemorizacao(memorizacoes[questao.numero]);
  } else {
    mostrarQuestao();
    window.scrollTo(0, 0);
  }
}


/* ---------------------------------------------------------
   13. TELAS DE MEMORIZAÇÃO
   --------------------------------------------------------- */
function mostrarMemorizacao(memo) {
  el("titulo-memorizacao").textContent = memo.titulo;

  const caixa = el("itens-memorizacao");
  caixa.innerHTML = "";
  memo.itens.forEach(function (item) {
    const div = document.createElement("div");
    div.className = "item-memo";
    div.textContent = item;
    caixa.appendChild(div);
  });

  atualizarCronometros(); // mostra 00:00 na questão (o total continua)
  mostrar(el("tela-memorizacao"));
}

function fecharMemorizacao() {
  esconder(el("tela-memorizacao"));
  mostrarQuestao(); // a questão seguinte já foi preparada em proximaQuestao()
  window.scrollTo(0, 0);
}


/* ---------------------------------------------------------
   14. FINALIZAR E CALCULAR OS RESULTADOS
   --------------------------------------------------------- */
function finalizarTeste() {
  tempoTotalSegundos = Math.round((Date.now() - inicioTeste) / 1000);
  pararCronometro();

  const resultado = calcularResultados();
  mostrarResultados(resultado);
}

function calcularResultados() {
  let acertos = 0;
  respostasUsuario.forEach(function (r) {
    if (r.acertou) acertos++;
  });

  const erros = TOTAL - acertos;
  const aproveitamento = (acertos / TOTAL) * 100;
  const tempoMedio = tempoTotalSegundos / TOTAL;

  // Aproveitamento por categoria
  const categorias = {};
  questoes.forEach(function (q, i) {
    if (!categorias[q.categoria]) categorias[q.categoria] = { total: 0, acertos: 0 };
    categorias[q.categoria].total++;
    if (respostasUsuario[i] && respostasUsuario[i].acertou) categorias[q.categoria].acertos++;
  });

  const qi = calcularQI();

  return {
    acertos: acertos,
    erros: erros,
    aproveitamento: aproveitamento,
    tempoTotal: tempoTotalSegundos,
    tempoMedio: tempoMedio,
    categorias: categorias,
    qi: qi.qi,
    pontos: qi.pontos,
    pontosMaximos: qi.pontosMaximos,
    percentualPontos: qi.percentual
  };
}

/* ---------------------------------------------------------
   FÓRMULA DO QI ESTIMADO
   Passo 1 — pontos de cada questão:
       acertou: 1 + bônus de rapidez
                bônus = 0,20 × (1 − tempo / 60)   (nunca negativo)
       errou:   −0,25
   Passo 2 — percentual de pontos:
       percentual = soma dos pontos ÷ pontos máximos × 100
       (pontos máximos = 34 × 1,20 = 40,8)
   Passo 3 — converter para a escala de QI (média do grupo = 100):
       abaixo da média:  QI = 100 + 15 × (percentual − média) ÷ desvio
       acima da média:   QI = 100 + 50 × (percentual − média) ÷ (100 − média)
       (assim, 100% dos pontos dá exatamente o QI máximo, 150)
   --------------------------------------------------------- */
function calcularQI() {
  let pontos = 0;

  respostasUsuario.forEach(function (resp) {
    if (resp.acertou) {
      const rapidez = Math.max(0, 1 - resp.tempo / CONFIG_QI.tempoLimite);
      pontos = pontos + 1 + CONFIG_QI.bonusMaximo * rapidez;
    } else {
      pontos = pontos - CONFIG_QI.penalidadeErro;
    }
  });

  const pontosMaximos = TOTAL * (1 + CONFIG_QI.bonusMaximo);
  const percentual = Math.max(0, (pontos / pontosMaximos) * 100);

  const media = CONFIG_QI.mediaReferencia;
  let qi;
  if (percentual >= media) {
    // Acima da média: vai de 100 (na média) até o máximo (com 100% dos pontos)
    qi = 100 + (CONFIG_QI.qiMaximo - 100) * (percentual - media) / (100 - media);
  } else {
    // Abaixo da média: escala tradicional de QI (15 pontos por desvio-padrão)
    qi = 100 + 15 * (percentual - media) / CONFIG_QI.desvioReferencia;
  }
  qi = Math.round(Math.min(CONFIG_QI.qiMaximo, Math.max(CONFIG_QI.qiMinimo, qi)));

  return { qi: qi, pontos: pontos, pontosMaximos: pontosMaximos, percentual: percentual };
}


/* ---------------------------------------------------------
   15. MOSTRAR A TELA DE RESULTADOS
   --------------------------------------------------------- */
function mostrarResultados(r) {
  esconder(el("tela-quiz"));
  esconder(el("cronometros"));
  mostrar(el("tela-resultados"));
  mostrar(el("rodape"));
  animar(el("tela-resultados"));

  const agora = new Date();
  el("resultado-data").textContent = "Concluído em " + agora.toLocaleDateString("pt-BR") +
    " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  el("res-total").textContent = TOTAL;
  el("res-acertos").textContent = r.acertos;
  el("res-erros").textContent = r.erros;
  el("res-aproveitamento").textContent = numeroBR(r.aproveitamento, 1) + "%";
  el("res-qi").textContent = r.qi;
  el("res-qi-detalhe").textContent = "Pontuação: " + numeroBR(r.pontos, 1) + " de " +
    numeroBR(r.pontosMaximos, 1) + " pontos (" + numeroBR(r.percentualPontos, 1) + "%)";
  el("res-tempo-total").textContent = formatarTexto(r.tempoTotal);
  el("res-tempo-medio").textContent = formatarTexto(r.tempoMedio);

  // Anima a barra de aproveitamento a partir do zero
  el("barra-aproveitamento").style.width = "0%";
  setTimeout(function () {
    el("barra-aproveitamento").style.width = r.aproveitamento + "%";
  }, 100);

  criarGraficos(r);
  montarRevisao();
  window.scrollTo(0, 0);
}


/* ---------------------------------------------------------
   16. GRÁFICOS (Chart.js)
   --------------------------------------------------------- */
function criarGraficos(r) {
  apagarGraficos();

  // Se a biblioteca não carregou (sem internet), avisa e segue sem gráficos
  if (typeof Chart === "undefined") {
    mostrar(el("aviso-graficos"));
    return;
  }
  esconder(el("aviso-graficos"));

  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.color = "#525E7D";

  // Gráfico 1 — pizza de acertos e erros
  graficos.push(new Chart(el("grafico-pizza"), {
    type: "pie",
    data: {
      labels: ["Acertos", "Erros"],
      datasets: [{ data: [r.acertos, r.erros], backgroundColor: ["#3B82F6", "#EF4444"], borderColor: "#fff", borderWidth: 2 }]
    },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  }));

  // Gráfico 2 — tempo gasto em cada questão
  graficos.push(new Chart(el("grafico-tempo"), {
    type: "bar",
    data: {
      labels: respostasUsuario.map(function (resp) { return "Q" + resp.numero; }),
      datasets: [{
        label: "Segundos",
        data: respostasUsuario.map(function (resp) { return resp.tempo; }),
        backgroundColor: respostasUsuario.map(function (resp) { return resp.acertou ? "#3B82F6" : "#EF4444"; }),
        borderRadius: 4
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: "segundos" } } }
    }
  }));

  // Gráfico 3 — aproveitamento (%) por categoria
  const nomes = Object.keys(r.categorias);
  graficos.push(new Chart(el("grafico-categorias"), {
    type: "bar",
    data: {
      labels: nomes,
      datasets: [{
        label: "Aproveitamento (%)",
        data: nomes.map(function (n) {
          const c = r.categorias[n];
          return Math.round((c.acertos / c.total) * 1000) / 10;
        }),
        backgroundColor: "#6D5DFB",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const c = r.categorias[ctx.label];
              return ctx.raw + "% (" + c.acertos + " de " + c.total + ")";
            }
          }
        }
      },
      scales: { x: { min: 0, max: 100, ticks: { callback: function (v) { return v + "%"; } } } }
    }
  }));
}

function apagarGraficos() {
  graficos.forEach(function (g) { g.destroy(); });
  graficos = [];
}


/* ---------------------------------------------------------
   17. REVISÃO DAS 34 QUESTÕES (cartões expansíveis)
   --------------------------------------------------------- */
function montarRevisao() {
  const lista = el("lista-revisao");
  lista.innerHTML = "";

  respostasUsuario.forEach(function (resp, i) {
    const q = questoes[i];
    const item = document.createElement("div");
    item.className = "item-revisao";

    // Cabeçalho clicável
    const cabecalho = document.createElement("button");
    cabecalho.type = "button";
    cabecalho.className = "item-revisao-cabecalho";
    cabecalho.innerHTML =
      '<span class="marcador ' + (resp.acertou ? "certo" : "errado") + '">' + (resp.acertou ? "✓" : "✕") + "</span>" +
      '<span class="item-revisao-titulo"></span>' +
      '<span class="item-revisao-tempo">' + formatarTexto(resp.tempo) + "</span>" +
      '<span class="item-revisao-seta">▼</span>';
    cabecalho.querySelector(".item-revisao-titulo").textContent = "Questão " + q.numero + " — " + q.enunciado;
    cabecalho.addEventListener("click", function () {
      item.classList.toggle("aberto");
    });

    // Detalhes
    const detalhes = document.createElement("div");
    detalhes.className = "item-revisao-detalhes";
    adicionarLinha(detalhes, "Resultado: ", resp.acertou ? "Acertou" : "Errou");
    adicionarLinha(detalhes, "Sua resposta: ", LETRAS[resp.selecionada] + ") " + q.alternativas[resp.selecionada]);
    adicionarLinha(detalhes, "Resposta correta: ", LETRAS[q.correta] + ") " + q.alternativas[q.correta]);
    adicionarLinha(detalhes, "Tempo gasto: ", formatarTexto(resp.tempo));
    if (q.explicacao) adicionarLinha(detalhes, "Explicação: ", q.explicacao);

    // Imagens originais (quando existem)
    if (q.imagem || q.imagensAlternativas) {
      const imagens = document.createElement("div");
      imagens.className = "revisao-imagens";
      if (q.imagem) imagens.appendChild(criarFigura(q.imagem, "Enunciado", "principal", ""));
      if (q.imagensAlternativas) {
        q.imagensAlternativas.forEach(function (src, j) {
          let classe = "";
          if (j === q.correta) classe = "correta";
          else if (j === resp.selecionada) classe = "escolhida-errada";
          imagens.appendChild(criarFigura(src, LETRAS[j], "", classe));
        });
      }
      detalhes.appendChild(imagens);
    }

    item.appendChild(cabecalho);
    item.appendChild(detalhes);
    lista.appendChild(item);
  });
}

function adicionarLinha(pai, rotulo, texto) {
  const p = document.createElement("p");
  const b = document.createElement("strong");
  b.textContent = rotulo;
  p.appendChild(b);
  p.appendChild(document.createTextNode(texto));
  pai.appendChild(p);
}

function criarFigura(src, legenda, classeImagem, classeFigura) {
  const figura = document.createElement("figure");
  if (classeFigura) figura.className = classeFigura;
  const img = document.createElement("img");
  img.src = src;
  img.alt = legenda;
  if (classeImagem) img.className = classeImagem;
  img.addEventListener("click", function () { ampliarImagem(src); });
  figura.appendChild(img);
  figura.appendChild(document.createTextNode(legenda));
  return figura;
}


/* ---------------------------------------------------------
   18. AMPLIAR IMAGEM
   --------------------------------------------------------- */
function ampliarImagem(src) {
  el("imagem-ampliada").src = src;
  mostrar(el("modal-zoom"));
}

function fecharImagem() {
  esconder(el("modal-zoom"));
}


/* ---------------------------------------------------------
   19. REINICIAR O TESTE
   --------------------------------------------------------- */
function reiniciarTeste() {
  const certeza = confirm("Deseja apagar as respostas desta tentativa e voltar à página inicial?");
  if (!certeza) return;

  pararCronometro();
  apagarGraficos();
  respostasUsuario = [];
  questaoAtual = 0;
  alternativaEscolhida = null;
  inicioQuestao = null;
  inicioTeste = null;

  esconder(el("tela-resultados"));
  esconder(el("tela-quiz"));
  esconder(el("cronometros"));
  mostrar(el("tela-inicial"));
  mostrar(el("rodape"));
  animar(el("tela-inicial"));
  window.scrollTo(0, 0);
}


/* ---------------------------------------------------------
   20. LINKS DO INSTAGRAM E WHATSAPP
   --------------------------------------------------------- */
function configurarRedesSociais() {
  el("link-instagram").href = CONFIG.instagramUrl;
  el("link-whatsapp").href = "https://wa.me/" + CONFIG.whatsappNumero +
    "?text=" + encodeURIComponent(CONFIG.whatsappMensagem);
}


/* ---------------------------------------------------------
   21. LIGAR OS BOTÕES ÀS FUNÇÕES (event listeners)
   --------------------------------------------------------- */
el("botao-iniciar").addEventListener("click", iniciarTeste);
el("botao-proxima").addEventListener("click", proximaQuestao);
el("botao-memorizacao").addEventListener("click", fecharMemorizacao);
el("botao-reiniciar").addEventListener("click", reiniciarTeste);

// Ampliação da imagem da questão
el("botao-zoom").addEventListener("click", function () { ampliarImagem(el("imagem-questao").src); });
el("imagem-questao").addEventListener("click", function () { ampliarImagem(el("imagem-questao").src); });

// Fechar a imagem ampliada: botão ✕, clique fora ou tecla Esc
el("fechar-zoom").addEventListener("click", fecharImagem);
el("modal-zoom").addEventListener("click", function (evento) {
  if (evento.target === el("modal-zoom")) fecharImagem();
});
document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") fecharImagem();
});

configurarRedesSociais();


/* ---------------------------------------------------------
   22. IMAGENS NA PASTA OU SOLTAS
   No computador as imagens ficam em "imagens/...". Se o site
   for publicado com as imagens soltas (na mesma pasta do
   index.html), esta função tenta de novo só com o nome do arquivo.
   --------------------------------------------------------- */
function tentarImagemSolta(img) {
  const caminho = img.getAttribute("src") || "";
  if (caminho.indexOf("imagens/") === -1) return; // já é o nome solto: não tenta de novo
  img.src = caminho.split("/").pop(); // ex.: "imagens/imagens_das_alternativas/Q7_A.png" -> "Q7_A.png"
}

// Vale para todas as imagens criadas durante o teste
document.addEventListener("error", function (evento) {
  if (evento.target.tagName === "IMG") tentarImagemSolta(evento.target);
}, true);

// O logo carrega antes deste arquivo, então é verificado aqui
document.querySelectorAll("img").forEach(function (img) {
  if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) tentarImagemSolta(img);
});
