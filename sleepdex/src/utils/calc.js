// TODOS OS NÚMEROS ABAIXO SÃO ESTIMATIVAS SIMPLIFICADAS (não são valores oficiais do jogo).
import { NATURES } from '../data/natures.js'
// Multiplicadores [aumenta, reduz]. sp multiplica o INTERVALO de ajuda (menor = mais rápido).
const M = { sp: [0.9, 1.075], in: [1.2, 0.8], sk: [1.2, 0.8] }
export const SUB_LEVELS = [10, 25, 50, 75, 100] // níveis em que cada sub-habilidade é liberada
export const nm = (nat, k) => { const x = NATURES[nat]; return !x ? 1 : x.up === k ? M[k][0] : x.down === k ? M[k][1] : 1 }
const fr = a => (a > 1 ? a / 100 : a) // a API pode guardar % como 18 ou 0.18
export const opts = (sp, k) => (sp['ingredient' + k] || []).filter(i => i.amount > 0)
export const ingChoice = (sp, mon, k) => { const o = opts(sp, k); return o.find(x => x.ingredient.name === mon.ing?.[k]) || o[0] }

export function subFx(mon, subs) {
  const act = mon.subskills.slice(0, SUB_LEVELS.filter(l => mon.level >= l).length)
  const sum = re => act.filter(s => re.test(s)).reduce((t, s) => t + fr(subs[s]?.amount ?? 0), 0)
  return { speed: sum(/^Helping Speed/), ing: sum(/^Ingredient Finder/), skill: sum(/^Skill Trigger/), berry: act.includes('Berry Finding S') ? subs['Berry Finding S']?.amount ?? 0 : 0 }
}

// Produção diária estimada: 24h de ajuda contínua, sem considerar energia, inventário nem bônus de nível.
export function estimate(mon, sp, subs) {
  const fx = subFx(mon, subs)
  const interval = sp.frequency * nm(mon.nature, 'sp') * Math.max(0.3, 1 - fx.speed)
  const helps = 86400 / interval
  const ingP = Math.min(1, (sp.ingredientPercentage / 100) * nm(mon.nature, 'in') * (1 + fx.ing))
  const slots = [0, 30, 60].filter(k => k === 0 || mon.level >= k).map(k => ingChoice(sp, mon, k)).filter(Boolean)
  const n = slots.length || 1
  const avgAmt = slots.reduce((t, s) => t + s.amount, 0) / n
  const avgVal = slots.reduce((t, s) => t + s.amount * s.ingredient.value, 0) / n
  const triggers = helps * (sp.skillPercentage / 100) * nm(mon.nature, 'sk') * (1 + fx.skill)
  const amts = sp.skill?.strengthAmounts
  const skillAmt = amts ? amts[Math.min(mon.skillLevel, amts.length) - 1] : null
  const berries = helps * (1 - ingP) * (1 + fx.berry)
  return { helps, berries, berryStrength: berries * sp.berry.value, ingCount: helps * ingP * avgAmt, ingStrength: helps * ingP * avgVal, skillTriggers: triggers, skillStrength: skillAmt ? triggers * skillAmt : null }
}

const W = { berry: [1, .25, .25], ing: [.25, 1, .25], skill: [.25, .25, 1], bal: [1, 1, 1] }
export const FOCUS = { berry: 'Berries', ing: 'Ingredientes', skill: 'Habilidades', bal: 'Equilibrada' }
// Pontuação 0–1 relativa ao grupo analisado: cada componente é dividido pelo maior valor do grupo.
export function rank(items, focus = 'bal', berry = '') {
  const mx = k => Math.max(...items.map(i => i.est[k]), 1e-9)
  const [wb, wi, ws] = W[focus]
  return items.map(i => {
    const c = { b: (i.est.berryStrength / mx('berryStrength')) * (berry && i.sp.berry.name === berry ? 1.25 : 1), i: i.est.ingStrength / mx('ingStrength'), s: i.est.skillTriggers / mx('skillTriggers') }
    return { ...i, c, score: (wb * c.b + wi * c.i + ws * c.s) / (wb + wi + ws) }
  })
}
export const sameBerry = ch => { const n = {}; ch.forEach(x => (n[x.sp.berry.name] = (n[x.sp.berry.name] || 0) + 1)); return Math.max(...Object.values(n)) }
const teamScore = ch => ch.reduce((t, x) => t + x.score, 0) / ch.length + (0.1 * (sameBerry(ch) - 1)) / 4 // bônus de sinergia de berry
export function bestTeam(ranked) {
  const pool = [...ranked].sort((a, b) => b.score - a.score).slice(0, 15), n = Math.min(5, pool.length)
  let best = null
  const go = (s, ch) => {
    if (ch.length === n) { const t = teamScore(ch); if (!best || t > best.t) best = { t, team: [...ch] }; return }
    for (let i = s; i <= pool.length - (n - ch.length); i++) { ch.push(pool[i]); go(i + 1, ch); ch.pop() }
  }
  if (n) go(0, [])
  return best
}
export function reason(x, focus) {
  const [k, txt] = [['b', 'produção de berries'], ['i', 'produção de ingredientes'], ['s', 'ativações de habilidade']].sort((a, b) => x.c[b[0]] - x.c[a[0]])[0]
  return `Destaque em ${txt} (${Math.round(x.c[k] * 100)}% do melhor do seu grupo). Pontuação ${FOCUS[focus]}: ${(x.score * 100).toFixed(0)}/100.`
}
export function analyze(team) {
  const avg = k => team.reduce((t, x) => t + x.c[k], 0) / team.length
  const names = { b: 'berries', i: 'ingredientes', s: 'habilidades' }
  const strong = [], weak = []
  Object.keys(names).forEach(k => { const a = avg(k); if (a >= 0.6) strong.push(`${names[k]} (${Math.round(a * 100)}%)`); else if (a < 0.35) weak.push(`${names[k]} (${Math.round(a * 100)}%)`) })
  const sb = sameBerry(team)
  if (sb >= 3) strong.push(`sinergia de berry: ${sb} integrantes com a mesma berry`)
  else weak.push('berries variadas, sem sinergia de berry')
  const s = team.reduce((t, x) => t + x.score, 0) / team.length
  const overall = s >= 0.7 ? 'Forte em relação ao seu grupo cadastrado.' : s >= 0.45 ? 'Boa, com margem para melhorar.' : 'Fraca para este foco: seu grupo cadastrado tem poucas opções melhores.'
  return { strong, weak, overall }
}
export const fmt = n => (n == null ? '—' : Math.round(n * 10) / 10)
