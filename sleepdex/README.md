# SleepDex

Otimizador de equipes para Pokémon Sleep (React + Vite + CSS puro). Dados da SleepAPI (`https://api.sleepapi.net/api`), cadastro no LocalStorage.

## Executar
    npm install
    npm run dev

## Publicar no GitHub Pages
1. Crie um repositório e envie o projeto para a branch `main`.
2. Em Settings → Pages → Source, escolha **GitHub Actions**.
3. A cada push em `main`, `.github/workflows/deploy.yml` faz o build e publica. Rotas usam `#/` (hash), então F5 funciona.

## Origem dos dados e limitações
- SleepAPI: espécies (`/pokemon`, `/pokemon/{name}`), naturezas (só nomes), sub-habilidades (`/subskill`).
- `src/data/natures.js`: efeitos das naturezas são tabela MANUAL (a API não os fornece).
- Produção e pontuações são ESTIMATIVAS simplificadas (veja `src/utils/calc.js`): sem energia, inventário, bônus de nível ou berry de especialidade.
- Filtro de ilha usa os parâmetros booleanos de `GET /api/pokemon`; o significado exato não é detalhado no Swagger.
- Sprites vêm do repositório PokeAPI/sprites (a SleepAPI não fornece imagens).
