import { useState } from 'react'
import { ISLANDS, ISLAND_LABEL, listPokemon } from '../services/sleepApi.js'
import { FOCUS, rank, bestTeam, analyze, coverage, fmt } from '../utils/calc.js'
import { Img, MonCard } from '../components/Ui.jsx'
export default function Team({ items, teams, setTeams, meta }) {
  const [island, setIsland] = useState(''), [berry, setBerry] = useState(''), [focus, setFocus] = useState('bal')
  const [target, setTarget] = useState({}), [sel, setSel] = useState([]), [msg, setMsg] = useState(''), [name, setName] = useState('')
  const berries = [...new Set(items.map(i => i.sp.berry.name))]
  const all = rank(items, focus, berry), team = all.filter(x => sel.includes(x.mon.id))
  const cov = coverage(team, target), an = team.length ? analyze(team) : null
  const sum = k => team.reduce((t, m) => t + m.est[k], 0)
  const bump = (k, d) => setTarget(t => ({ ...t, [k]: Math.max(0, (t[k] || 0) + d) }))
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : s.length < 5 ? [...s, id] : s))
  const run = async () => {
    setMsg('')
    let pool = items
    if (island) { try { const ok = await listPokemon(island); pool = items.filter(i => ok.includes(i.sp.name)) } catch (e) { return setMsg('Filtro de ilha indisponível: ' + e.message) } }
    if (!pool.length) return setMsg('Nenhum dos seus Pokémon passa pelo filtro de ilha.')
    setSel(bestTeam(rank(pool, focus, berry), target).team.map(x => x.mon.id))
  }
  const save = () => { setTeams([{ id: crypto.randomUUID(), name: name.trim() || `Equipe ${teams.length + 1}`, date: Date.now(), ids: sel }, ...teams].slice(0, 20)); setName(''); setMsg('Equipe salva ✔') }
  return <div className="team">
    <aside className="card">
      <h2>Ilha</h2>
      <div className="tiles">{['', ...ISLANDS].map(k => <button key={k} className={'tile' + (island === k ? ' on' : '')} onClick={() => setIsland(k)}><Img kind="island" name={k || 'greengrass'} size={40} /><small>{k ? ISLAND_LABEL[k] : 'Qualquer'}</small></button>)}</div>
      <h2>Berry favorita da semana</h2>
      <div className="chips"><button className={'chip' + (!berry ? ' on' : '')} onClick={() => setBerry('')}>Qualquer</button>{berries.map(b => <button key={b} className={'chip' + (berry === b ? ' on' : '')} onClick={() => setBerry(b)}><Img kind="berry" name={b} size={20} /> {b}</button>)}</div>
      <h2>Foco</h2>
      <div className="chips">{Object.entries(FOCUS).map(([k, v]) => <button key={k} className={'chip' + (focus === k ? ' on' : '')} onClick={() => setFocus(k)}>{v}</button>)}</div>
      <h2>Receita alvo <small className="muted">(ingredientes por dia)</small></h2>
      <div className="tiles ing">{meta.ingredients.map(n => <div key={n} className={'tile' + (target[n] ? ' on' : '')}><Img kind="ing" name={n} size={34} /><small>{n}</small><div className="step"><button onClick={() => bump(n, -1)}>−</button><b>{target[n] || 0}</b><button onClick={() => bump(n, 1)}>+</button></div></div>)}</div>
      <button className="btn big" onClick={run} disabled={!items.length}>✨ Sugerir melhor time</button>
      {!items.length && <p className="muted">Cadastre Pokémon em “Meus Pokémon” primeiro.</p>}{msg && <p className="muted">{msg}</p>}
    </aside>
    <section>
      <div className="card"><h2>Time ({sel.length}/5)</h2>
        <div className="slots">{[0, 1, 2, 3, 4].map(i => team[i] ? <MonCard key={team[i].mon.id} m={team[i]} on onClick={() => toggle(team[i].mon.id)} /> : <div key={i} className="mcard empty">vazio</div>)}</div>
        {an && <>
          <div className="stats"><div><b>{fmt(sum('berries'))}</b><span>berries/dia</span></div><div><b>{fmt(sum('ingCount'))}</b><span>ingredientes/dia</span></div><div><b>{fmt(sum('skillTriggers'))}</b><span>ativações/dia</span></div></div>
          {!!cov.length && <div className="cov">{cov.map(c => <div key={c.k} className="covrow"><Img kind="ing" name={c.k} size={24} /><span>{c.k}</span><div className="bar"><i style={{ width: c.pct * 100 + '%' }} className={c.pct >= 1 ? 'full' : ''} /></div><small>{fmt(c.got)}/{c.need}</small></div>)}</div>}
          <p><b>Pontos fortes:</b> {an.strong.join('; ') || 'nenhum destaque claro'}</p>
          <p><b>Pontos fracos:</b> {an.weak.join('; ') || 'nenhum ponto fraco claro'}</p>
          <p><b>Avaliação:</b> {an.overall}</p>
          <div className="row"><input placeholder="Nome da equipe" value={name} onChange={e => setName(e.target.value)} /><button className="btn" onClick={save}>Salvar equipe</button></div>
          <p className="muted">Estimativas simplificadas (24h de ajuda, sem energia/inventário), notas relativas ao seu grupo. Clique num Pokémon para tirar ou colocar no time.</p>
        </>}
      </div>
      <div className="card"><h2>Seus Pokémon</h2>
        <div className="grid2">{all.map(m => <MonCard key={m.mon.id} m={m} on={sel.includes(m.mon.id)} disabled={!sel.includes(m.mon.id) && sel.length >= 5} onClick={() => toggle(m.mon.id)} />)}</div>
        {!items.length && <p className="muted">Nada cadastrado ainda.</p>}
      </div>
    </section>
  </div>
}
