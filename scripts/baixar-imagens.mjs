// Uso: node scripts/baixar-imagens.mjs   (precisa de internet; roda uma vez, depois faça commit de public/img)
// Fonte: Bulbagarden Archives (sprites de Pokémon Sleep, 256x256). Imagens pertencem à The Pokémon Company; uso pessoal.
import { mkdir, writeFile } from 'node:fs/promises'
const WIKI = 'https://archives.bulbagarden.net/wiki/Special:Redirect/file/'
const ING = { apple: 'Fancy Apple', milk: 'Moomoo Milk', honey: 'Honey', ginger: 'Warming Ginger', egg: 'Fancy Egg', leek: 'Large Leek', mushroom: 'Tasty Mushroom', oil: 'Pure Oil', potato: 'Soft Potato', tomato: 'Snoozy Tomato', sausage: 'Bean Sausage', soybean: 'Greengrass Soybeans', corn: 'Greengrass Corn', coffee: 'Rousing Coffee', herb: 'Fiery Herb', tail: 'Slowpoke Tail', cacao: 'Soothing Cacao', pumpkin: 'Plump Pumpkin' }
const BERRY = 'belue bluk cheri chesto durin figy grepa leppa lum mago oran pamtre pecha persim rawst sitrus wiki yache'.split(' ')
const jobs = [...Object.entries(ING).map(([k, f]) => ['ing', k, `Sleep ${f}.png`]), ...BERRY.map(k => ['berry', k, `Sleep ${k[0].toUpperCase() + k.slice(1)} Berry.png`])]
let ok = 0
for (const [kind, key, file] of jobs) {
  try {
    const r = await fetch(WIKI + encodeURIComponent(file.replaceAll(' ', '_')))
    if (!r.ok) throw new Error('HTTP ' + r.status)
    await mkdir(`public/img/${kind}`, { recursive: true })
    await writeFile(`public/img/${kind}/${key}.png`, Buffer.from(await r.arrayBuffer())); ok++
  } catch (e) { console.log('FALHOU', kind, key, e.message) }
}
console.log(`${ok}/${jobs.length} imagens baixadas em public/img`)
