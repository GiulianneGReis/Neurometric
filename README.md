# NeuroMetric — Cognitive Lab

Protótipo acadêmico de um site de avaliação cognitiva com **34 questões interativas**, feito apenas com **HTML, CSS e JavaScript puro**.

> O resultado mostrado é um **percentual de acertos**. Ele **não** é um QI psicométrico validado nem um diagnóstico psicológico.

---

## 1. Objetivo

Permitir que qualquer pessoa abra o site, clique em **Iniciar Quiz**, responda às 34 questões e veja seus resultados (acertos, erros, aproveitamento, tempos, gráficos e revisão comentada).

## 2. Tecnologias utilizadas

| Tecnologia | Para que serve |
|---|---|
| HTML5 | Estrutura das telas (`index.html`) |
| CSS3 | Cores, layout, animações e versão para celular (`style.css`) |
| JavaScript puro | Toda a lógica do teste (`script.js`) |
| Chart.js (por CDN) | Desenhar os 3 gráficos da tela de resultados |
| Fonte Inter (Google Fonts) | Mesma fonte do design original |

Não há backend, banco de dados, login ou cadastro.

## 3. Estrutura dos arquivos

```text
NeuroMetric/
├── index.html      → todas as telas (início, questão, memorização, resultados)
├── style.css       → todo o visual
├── script.js       → todo o funcionamento
├── README.md       → este arquivo
└── imagens/
    ├── logo.png
    ├── Q1.png, Q2.png, Q3.png, Q7.png, Q8.png, Q11.png ... Q20.png
    ├── Q12.svg     → figura da Questão 12 (veio do design como desenho SVG)
    └── imagens_das_alternativas/
        ├── Q7_A.png ... Q7_E.png
        └── ... (Q8, Q11 a Q20)
```

## 4. Como executar

**Jeito mais simples:** dê dois cliques no arquivo `index.html`. Ele abre no navegador.

**No Visual Studio Code:**
1. Abra o VS Code → **File > Open Folder…** → escolha a pasta `NeuroMetric`.
2. Instale a extensão **Live Server** (Ritwick Dey), na aba de extensões (Ctrl+Shift+X).
3. Clique com o botão direito em `index.html` → **Open with Live Server**.
4. O site abre no navegador e recarrega sozinho quando você salva um arquivo.

> Os gráficos usam a biblioteca Chart.js pela internet. Sem internet, o teste funciona normalmente e os números aparecem; apenas os gráficos não são desenhados (o site mostra um aviso).

## 5. Como funciona a navegação

```text
Página inicial → Q1 → Q2 → Q3 → [Memorize: 2 3 1 9 7]
→ Q4 → Q5 → Q6 → [Memorize: 9 6 2 0 8 4]
→ Q7 ... Q34 → Resultados
```

- Existe **um único modelo de questão** no HTML. A função `mostrarQuestao()` troca o enunciado, a imagem, as alternativas e o progresso.
- O botão **Próxima questão** fica desabilitado até uma alternativa ser escolhida. Na Questão 34 ele vira **Finalizar teste**.
- As telas de memorização ficam no objeto `memorizacoes` do `script.js` e **não contam como questão**.

## 6. Como as questões são armazenadas

Todas ficam no array `questoes`, dentro do `script.js`. Exemplo:

```javascript
{
  numero: 1,
  categoria: "Raciocínio Dedutivo",
  enunciado: "Um fazendeiro tem 50 galinhas. Todas morrem, menos 37. Quantas sobram?",
  alternativas: ["23", "20", "30", "13", "37"],
  correta: 4,            // 0=A, 1=B, 2=C, 3=D, 4=E  → aqui é a E
  explicacao: "Todas morrem, exceto 37.",
  imagem: "imagens/Q1.png"   // ou null se não tiver imagem
}
```

Campos opcionais:
- `descricao` → texto menor abaixo do enunciado;
- `imagensAlternativas` → lista com as 5 imagens das alternativas (questões visuais);
- `sequencia` → números mostrados em caixinhas (ex.: `["3", "6", "12", "24", "?"]`);
- `grade` → 9 valores para uma grade 3×3;
- `cartoes` e `perguntaFinal` → cartões de afirmações (Questões 23 e 34).

## 7. Como funcionam os cronômetros

Usam apenas `Date.now()` e `setInterval()`:

- **Esta questão**: começa em `00:00` quando a questão aparece (`inicioQuestao = Date.now()`) e para quando o usuário clica em Próxima. O tempo é salvo na resposta.
- **Tempo total**: começa no **Iniciar Quiz** (`inicioTeste = Date.now()`), continua durante as memorizações e para ao finalizar a Questão 34.
- A cada 1 segundo, `atualizarCronometros()` calcula `Date.now() - início` e mostra na tela.
- Os 7 minutos são apenas uma estimativa: não há limite de tempo.

## 8. Como os resultados são calculados

Cada resposta é guardada no array `respostasUsuario`:

```javascript
{ numero: 1, selecionada: 4, correta: 4, acertou: true, tempo: 6.3 }
```

Ao finalizar:

```javascript
const aproveitamento = (acertos / 34) * 100;
const erros = 34 - acertos;
const tempoMedio = tempoTotalSegundos / 34;
```

Os gráficos usam esses mesmos dados reais:
1. **Pizza** — acertos × erros;
2. **Barras** — segundos gastos em cada questão (azul = acerto, vermelho = erro);
3. **Barras** — aproveitamento (%) por categoria.

Abaixo aparece a **Revisão da avaliação**: clique em cada questão para ver sua resposta, a correta, o tempo e a explicação (com as imagens, quando houver).

### QI estimado

A função `calcularQI()` transforma o desempenho em um número na escala de QI (média 100, desvio 15):

1. **Pontos por questão**
   - acertou: `1 + 0,20 × (1 − tempo ÷ 60)` → vale de 1,00 (60 s ou mais) até 1,20 (resposta instantânea);
   - errou: `−0,25` (desconto de "chute", já que há 5 alternativas).
2. **Percentual de pontos**: `soma dos pontos ÷ 40,8 × 100` (40,8 = 34 × 1,20, o máximo possível).
3. **QI estimado**: `100 + 15 × (percentual − média do grupo) ÷ desvio do grupo`, limitado entre 55 e 145.

A média (55) e o desvio (18) do grupo ficam em `CONFIG_QI`, no início do `script.js`, e são **provisórios**. Para calibrar: aplique o teste em várias pessoas (de preferência 30 ou mais), anote o percentual de pontos de cada uma (aparece no cartão "QI estimado") e calcule a média e o desvio-padrão desses valores (no Excel: `=MÉDIA(...)` e `=DESVPAD(...)`). Depois troque os dois números no `CONFIG_QI`.

> Mesmo calibrado, é uma estimativa educacional. Não equivale a um teste de QI aplicado por psicólogo.

## 9. Como configurar Instagram e WhatsApp

No início do `script.js`:

```javascript
const CONFIG = {
  instagramUrl: "https://www.instagram.com/SEU_USUARIO/",
  whatsappNumero: "55DDDNUMERO",   // ex.: "5515999998888" (só números)
  whatsappMensagem: "Olá! Gostaria de saber mais sobre o NeuroMetric."
};
```

Troque `SEU_USUARIO` e `55DDDNUMERO` pelos dados verdadeiros. O WhatsApp abre com a mensagem já preenchida.

## 10. Como adicionar ou editar questões

1. Abra o `script.js` e encontre o array `questoes`.
2. Edite o texto, as alternativas ou o número em `correta` (lembre: começa em 0).
3. Para uma nova questão, copie um bloco `{ ... }`, cole no final e ajuste o `numero`.
4. Se mudar a quantidade total, revise os textos "34" do `index.html`.

## 11. Como substituir imagens

- Imagem principal: salve como `imagens/Q<número>.png` (ex.: `Q7.png`) e use em `imagem`.
- Alternativas: salve como `imagens/imagens_das_alternativas/Q<número>_<letra>.png` (ex.: `Q7_A.png`).
- A função `imagensDaQuestao(7)` monta automaticamente os 5 caminhos de `Q7_A.png` a `Q7_E.png`.
- Se mantiver o mesmo nome de arquivo, basta substituir a imagem na pasta.
- Clique em qualquer imagem durante o teste ou na revisão para vê-la ampliada.

## 12. Observações sobre o conteúdo

- Os enunciados, alternativas e imagens vieram das telas exportadas do Google Stitch. Os arquivos não traziam gabarito, então as respostas e explicações foram deduzidas a partir do conteúdo de cada questão. Vale conferir com o banco oficial, principalmente as **Questões 12 e 17**.
- A figura principal da Questão 12 só existia como um desenho SVG dentro do HTML (não como imagem), por isso está em `imagens/Q12.svg`.
- O enunciado da Questão 9 ("Qual figura continua a rotação?") foi mantido como no original, embora a questão seja uma grade de números.
