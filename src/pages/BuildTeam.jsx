import { useState } from 'react'
import { MonLine, TeamView } from '../components/Ui.jsx'
export default function BuildTeam({ items, teams, setTeams }) {
  const [sel, setSel] = useState([]), [name, setName] = useState('')
  const toggle = id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : s.length < 5 ? [...s, id] : s))
  const save = () => { setTeams([{ id: crypto.randomUUID(), name: name.trim() || `Equipe ${teams.length + 1}`, date: Date.now(), ids: sel }, ...teams].slice(0, 20)); setName(''); alert('Equipe salva!') }
  return <>
    <h1>Montar Equipe</h1>
    <div className="card"><h2>Escolha até 5 ({sel.length}/5)</h2>
      {!items.length && <p className="muted">Cadastre Pokémon primeiro em “Meus Pokémon”.</p>}
      {items.map(i => <label key={i.mon.id} className="monline pick"><input type="checkbox" checked={sel.includes(i.mon.id)} disabled={!sel.includes(i.mon.id) && sel.length >= 5} onChange={() => toggle(i.mon.id)} /><MonLine mon={i.mon} sp={i.sp} /></label>)}</div>
    <div className="card"><h2>Resumo da equipe</h2><TeamView members={items.filter(i => sel.includes(i.mon.id))} />
      {!!sel.length && <div className="row"><input placeholder="Nome da equipe" value={name} onChange={e => setName(e.target.value)} /><button className="btn" onClick={save}>Salvar equipe</button></div>}</div>
  </>
}
