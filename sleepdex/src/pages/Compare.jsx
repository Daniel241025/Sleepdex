import { useState } from 'react'
import { FOCUS, rank, fmt } from '../utils/calc.js'
import { SPEC } from '../components/Ui.jsx'
export default function Compare({ items }) {
  const [sel, setSel] = useState([]), [focus, setFocus] = useState('bal')
  const ranked = rank(items.filter(i => sel.includes(i.mon.id)), focus)
  const rows = [['Espécie', x => x.sp.displayName], ['Nível', x => x.mon.level], ['Natureza', x => x.mon.nature], ['Especialidade', x => SPEC[x.sp.specialty] || x.sp.specialty], ['Berry', x => x.sp.berry.name],
    ['Berries/dia', x => x.est.berries, 1], ['Ingredientes/dia', x => x.est.ingCount, 1], ['Ativações/dia', x => x.est.skillTriggers, 1], ['Pontuação (0–100)', x => x.score * 100, 1]]
  const topScore = Math.max(...ranked.map(r => r.score), 0)
  return <>
    <h1>Comparar Pokémon</h1>
    <div className="card"><h2>Selecione 2 ou mais</h2>
      {!items.length && <p className="muted">Cadastre Pokémon primeiro.</p>}
      <div className="chips">{items.map(i => <label key={i.mon.id} className={'chip' + (sel.includes(i.mon.id) ? ' on' : '')}><input type="checkbox" hidden checked={sel.includes(i.mon.id)} onChange={() => setSel(s => (s.includes(i.mon.id) ? s.filter(x => x !== i.mon.id) : [...s, i.mon.id]))} />{i.mon.name}</label>)}</div>
      <label>Preferência<select value={focus} onChange={e => setFocus(e.target.value)}>{Object.entries(FOCUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
    </div>
    {ranked.length >= 2 && <div className="card"><div className="scroll"><table><thead><tr><th /> {ranked.map(r => <th key={r.mon.id}>{r.mon.name}</th>)}</tr></thead><tbody>
      {rows.map(([label, fn, num]) => { const vals = ranked.map(fn); const mx = num ? Math.max(...vals) : null
        return <tr key={label}><th>{label}</th>{vals.map((v, i) => <td key={i} className={num && v === mx ? 'best' : ''}>{num ? fmt(v) : v}</td>)}</tr> })}
    </tbody></table></div>
      <p><b>Melhor para “{FOCUS[focus]}”:</b> {ranked.filter(r => r.score === topScore).map(r => r.mon.name).join(', ')}</p>
      <p className="muted">Pontuação relativa entre os Pokémon selecionados; estimativa simplificada (mesmos critérios do Otimizador).</p></div>}
  </>
}
