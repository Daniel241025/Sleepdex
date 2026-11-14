// Endpoints confirmados no Swagger/testes: /pokemon[?ilha=true], /pokemon/{name}, /nature, /subskill, /subskill/{name}
const BASE = 'https://api.sleepapi.net/api'
const cache = {}
async function get(p) {
  if (cache[p]) return cache[p]
  const r = await fetch(BASE + p)
  if (!r.ok) throw new Error(`SleepAPI respondeu ${r.status} em ${p}`)
  return (cache[p] = await r.json())
}
export const ISLANDS = ['cyan', 'taupe', 'snowdrop', 'lapis', 'powerplant', 'amber']
export const ISLAND_LABEL = { cyan: 'Cyan Beach', taupe: 'Taupe Hollow', snowdrop: 'Snowdrop Tundra', lapis: 'Lapis Lakeside', powerplant: 'Old Gold Power Plant', amber: 'Amber Canyon' }
export const listPokemon = island => get('/pokemon' + (island ? `?${island}=true` : ''))
export const getPokemon = n => get('/pokemon/' + encodeURIComponent(n))
export async function loadMeta() {
  const [list, natures, subNames, ingredients] = await Promise.all([get('/pokemon'), get('/nature'), get('/subskill'), get('/ingredient')])
  const subs = Object.fromEntries(await Promise.all(subNames.map(async n => [n, await get('/subskill/' + encodeURIComponent(n))])))
  return { list, natures, subs, ingredients: ingredients.filter(n => n !== 'Locked') }
}
// Imagem: sprite do repositório PokeAPI/sprites (a SleepAPI não fornece imagem da espécie).
export const sprite = n => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`
