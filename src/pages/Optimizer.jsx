import { useState } from 'react'
import { ISLANDS, listPokemon } from '../services/sleepApi.js'
import { FOCUS, rank, bestTeam, reason, analyze } from '../utils/calc.js'
import { TeamView, MonLine } from '../components/Ui.jsx'
export default function Optimizer({ items, teams, setTeams }) {
  const [island, setIsland] = useState(''), [berry, setBerry] = useState(''), [focus, setFocus] = useState('bal')
  const [res, setRes] = useState(null), [msg, setMsg] = useState('')
  const berries = [...new Set(items.map(i => i.sp.berry.name))]
  const run = async () => {
    setMsg(''); setRes(null)
    let pool = items
    if (island) {
      try { const ok = await listPokemon(island); pool = items.filter(i => ok.includes(i.sp.name)) } catch (e) { return setMsg('Não foi possível filtrar por ilha: ' + e.message) }
    }
    if (!pool.length) return setMsg('Nenhum dos seus Pokémon passa pelo filtro escolhido.')
    const ranked = rank(pool, focus, berry), best = bestTeam(ranked)
    setRes({ ranked, team: best.team, focus, ...analyze(best.team), short: best.team.length < 5 })
  }
  const saveTeam = () => setTeams([{ id: crypto.randomUUID(), name: `Otimizada (${FOCUS[res.focus]})`, date: Date.now(), ids: res.team.map(x => x.mon.id) }, ...teams].slice(0, 20))
  return <>
    <h1>Otimizador</h1>
    <div className="card form"><h2>Preferências</h2>
      <label>Ilha (filtro da SleepAPI)<select value={island} onChange={e => setIsland(e.target.value)}><option value="">Qualquer</option>{ISLANDS.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Berry preferida<select value={berry} onChange={e => setBerry(e.target.value)}><option value="">Sem preferência</option>{berries.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Foco<select value={focus} onChange={e => setFocus(e.target.value)}>{Object.entries(FOCUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <div><button className="btn" onClick={run} disabled={!items.length}>Sugerir equipe</button></div>
      {!items.length && <p className="muted">Cadastre Pokémon primeiro.</p>}{msg && <p className="error">{msg}</p>}
    </div>
    {res && <div className="card">
      <h2>Equipe sugerida</h2>{res.short && <p className="muted">Você tem menos de 5 Pokémon elegíveis; a equipe tem {res.team.length}.</p>}
      {res.team.map(x => <div key={x.mon.id}><MonLine mon={x.mon} sp={x.sp} /><p className="reason">{reason(x, res.focus)}</p></div>)}
      <TeamView members={res.team} />
      <p><b>Pontos fortes:</b> {res.strong.join('; ') || 'nenhum destaque claro'}</p>
      <p><b>Pontos fracos:</b> {res.weak.join('; ') || 'nenhum ponto fraco claro'}</p>
      <p><b>Avaliação geral:</b> {res.overall}</p>
      <button className="btn" onClick={saveTeam}>Salvar como equipe</button>
      <details><summary>Como a pontuação é calculada (estimativa)</summary>
        <p className="muted">Para cada Pokémon: produção diária estimada de berries (nº de berries × valor da berry), ingredientes (quantidade × valor do ingrediente) e ativações de habilidade, usando frequência, chances, berry e ingredientes da SleepAPI, natureza (tabela manual) e sub-habilidades. Cada componente é dividido pelo maior valor entre seus Pokémon (0 a 1) e combinado com pesos conforme o foco (foco principal = 1, outros = 0,25; equilibrada = 1/1/1). Berry preferida multiplica a nota de berry por 1,25. A equipe é a melhor combinação entre os 15 melhores Pokémon individuais: média das notas + até 0,1 de bônus por berries iguais. Não considera energia, inventário, nível nem bônus do jogo. As notas são relativas ao SEU grupo, não valores oficiais.</p></details>
    </div>}
  </>
}
