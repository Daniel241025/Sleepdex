# 🌙 SleepDex

Ferramenta pessoal para montar equipes de **Pokémon Sleep**: cadastre os Pokémon que você tem, escolha ilha, berry e uma receita-alvo, e o app sugere o melhor time de 5 usando os dados da [SleepAPI](https://api.sleepapi.net/docs/) (Neroli's Lab).

Site estático (React + Vite + CSS puro), sem backend, publicado no GitHub Pages. Seus dados ficam no navegador (LocalStorage).

> Projeto não oficial. Pokémon e Pokémon Sleep são marcas da The Pokémon Company; as imagens do jogo são usadas apenas para fins pessoais.

## Funcionalidades

| Aba                   | O que faz                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Montar Time**       | Escolha ilha, berry favorita da semana, foco e uma receita-alvo (ingredientes por dia). O app sugere o time de 5, mostra produção, cobertura de cada ingrediente, pontos fortes e fracos, e permite ajustar à mão, salvar, carregar, renomear e excluir equipes. |
| **Meus Pokémon**      | Cadastro (espécie, nível, natureza, sub-habilidades, ingredientes, nível da habilidade), edição, etiquetas de sub-habilidade por raridade, **importação por arquivo JSON** e **backup/restauração**.                                                             |
| **Explorar**          | As espécies da SleepAPI com filtros (nome, ilha, especialidade, berry) e ordenação por produção estimada.                                                                                                                                                        |
| **Tiers por ilha**    | Tiers S/A/B/C estimados por ilha e por papel (berries, ingredientes, habilidades), marcando o que você já tem e o que falta capturar.                                                                                                                            |
| **Natureza ideal**    | Compara as naturezas para cada Pokémon seu e mostra o ganho estimado de trocar.                                                                                                                                                                                  |
| **Onde gastar doces** | Quanto a produção sobe ao chegar ao nível 30 e ao 60 (ingredientes extras).                                                                                                                                                                                      |
| **Comparar**          | Compara dois ou mais Pokémon seus lado a lado.                                                                                                                                                                                                                   |

## Como rodar

Precisa do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install
npm run dev        # abre em http://localhost:5173
npm test           # testes dos cálculos
npm run build      # gera a pasta dist
```

### Ícones (ingredientes, berries e ilhas)

Os ícones ficam em `public/img/ing`, `public/img/berry` e `public/img/island`. Para baixá-los (uma vez, com internet):

```bash
node scripts/baixar-imagens.mjs
```

O script baixa os ícones do Neroli's Lab e mostra `FALHOU` para o que não conseguir. Sem o arquivo, o app mostra um emoji no lugar. Depois faça commit da pasta `public/img`. Se tiver baixado imagens manualmente com os nomes originais, `node scripts/organizar-imagens.mjs` as copia para o lugar certo.

As imagens dos Pokémon vêm do repositório [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

## Importar Pokémon por arquivo

Em **Meus Pokémon → Importar Pokémon**, escolha um `.json` ou cole o texto. O app mostra uma prévia, avisa o que não reconheceu e só salva depois que você confirmar. Importar de novo atualiza os Pokémon com o mesmo nome, espécie e nível, sem duplicar.

```json
[
  {
    "name": "Meu Pikachu",
    "species": "PIKACHU",
    "level": 45,
    "nature": "Adamant",
    "subskills": ["Helping Speed S", "Berry Finding S", "Skill Trigger M"],
    "ing": { "0": "Apple", "30": "Honey" },
    "skillLevel": 4,
    "ingQty": { "0": 1, "30": 2 }
  }
]
```

`ingQty` é opcional: se informado, o app confere a quantidade com a da SleepAPI e avisa se não bater.

## Seus dados e backup

Tudo é salvo no **LocalStorage** do navegador (`sleepdex:mons` e `sleepdex:teams`). Cada endereço guarda os seus próprios dados: `localhost` e o site publicado são separados, assim como cada navegador e aparelho. Limpar os dados do navegador apaga tudo, então use **Meus Pokémon → Exportar backup** de vez em quando e **Restaurar backup** para levar os dados a outro lugar.

## Publicar no GitHub Pages

1. Envie o projeto para a branch `main` de um repositório **público**.
2. Em **Settings → Pages → Source**, escolha **GitHub Actions**.
3. A cada push em `main`, o workflow `.github/workflows/deploy.yml` faz o build e publica em `https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/`.

O Vite usa `base: './'` (caminhos relativos) e as rotas usam `#/pagina`, então atualizar a página funciona. O arquivo `.gitignore` deve conter `node_modules` e `dist`.

## De onde vêm os dados

- **SleepAPI** (`https://api.sleepapi.net/api`, aceita requisições direto do navegador): `/pokemon` (aceita filtros de ilha), `/pokemon/{nome}`, `/nature`, `/subskill`, `/subskill/{nome}` e `/ingredient`.
- **Efeito das naturezas:** a API só lista os nomes. Os efeitos estão numa tabela manual em `src/data/natures.js` (quais atributos sobem e descem, conferido em Bulbapedia, Serebii e Game8). Os percentuais usados são aproximados.
- **Níveis de liberação** (conferidos em prints do jogo): sub-habilidades nos níveis 10, 25, 50, 70 e 80; ingredientes nos níveis 1, 30 e 60.

## Como os números são calculados

Todos os valores de produção, pontuações e tiers são **estimativas simplificadas feitas pelo app**, e não números oficiais do jogo. Em resumo (veja `src/utils/calc.js`):

- 24 horas de ajuda contínua, a partir da frequência base da espécie, modificada por natureza e sub-habilidades.
- Berries = ajudas × (1 − chance de ingrediente) × valor da berry. Ingredientes = ajudas × chance de ingrediente × quantidade média dos slots liberados.
- Pontuação 0–1 relativa ao grupo analisado (cada componente dividido pelo melhor do grupo), com pesos conforme o foco; berry preferida multiplica a nota de berry por 1,25; times ganham um pequeno bônus por berries iguais.
- **Não consideram** energia, inventário, bônus de nível, berry de especialidade nem EXP.

## Limitações conhecidas

- **Pratos prontos** (grupo `meal` da API) ainda não estão integrados; a receita-alvo é montada à mão.
- O **filtro de ilha** usa os parâmetros booleanos de `GET /api/pokemon`, cujo significado exato a documentação não detalha. Greengrass não tem filtro.
- Algumas espécies podem falhar na API (erro 500, por exemplo na Clefable). O app avisa e deixa essas espécies fora dos cálculos, com botão para tentar de novo.
- O endereço dos ícones do Neroli's Lab contém um código que pode mudar se eles republicarem o site; se o download falhar, a lista em `scripts/baixar-imagens.mjs` precisa ser atualizada.

## Estrutura

```
sleepdex/
├─ index.html · package.json · vite.config.js
├─ .github/workflows/deploy.yml     publicação no GitHub Pages
├─ scripts/                         baixar-imagens.mjs · organizar-imagens.mjs
├─ public/img/                      ícones (ing, berry, island)
├─ tests/calc.test.mjs              testes dos cálculos (npm test)
└─ src/
   ├─ App.jsx · main.jsx · styles.css
   ├─ pages/        Team · MyPokemon · Explore · Tiers · Natures · Potential · Compare
   ├─ components/   Ui.jsx (ícones, cards, etiquetas)
   ├─ services/     sleepApi.js · storage.js
   ├─ utils/        calc.js (estimativas, ranking, otimizador)
   └─ data/         natures.js
```
