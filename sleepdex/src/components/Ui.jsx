import { sprite } from '../services/sleepApi.js'
import { fmt, sameBerry } from '../utils/calc.js'
export const SPEC = { berry: 'Berries', ingredient: 'Ingredientes', skill: 'Habilidades', all: 'Todas' }
export const Sprite = ({ sp }) => sp ? <img className="sprite" src={sprite(sp.pokedexNumber)} alt="" onError={e => (e.target.style.visibility = 'hidden')} /> : <div className="sprite" />
export function MonLine({ mon, sp, children }) {
  return <div className="monline"><Sprite sp={sp} /><div><b>{mon.name}</b><div className="muted">{sp?.displayName ?? mon.species} · Nv {mon.level} · {mon.nature}{sp ? ` · ${SPEC[sp.specialty] || sp.specialty}` : ''}</div></div><div className="grow" />{children}</div>
}
export function TeamView({ members }) {
  if (!members.length) return <p className="muted">Nenhum integrante selecionado.</p>
  const tot = k => members.reduce((t, m) => t + m.est[k], 0)
  const spec = {}, berry = {}
  members.forEach(m => { spec[SPEC[m.sp.specialty] || m.sp.specialty] = (spec[SPEC[m.sp.specialty] || m.sp.specialty] || 0) + 1; berry[m.sp.berry.name] = (berry[m.sp.berry.name] || 0) + 1 })
  const list = o => Object.entries(o).map(([k, v]) => `${k} ×${v}`).join(', ')
  return <>
    <div className="scroll"><table><thead><tr><th>Pokémon</th><th>Berries/dia</th><th>Ingred./dia</th><th>Habilidade</th><th>Ativações/dia</th></tr></thead><tbody>
      {members.map(m => <tr key={m.mon.id}><td><MonLine mon={m.mon} sp={m.sp} /></td><td>{fmt(m.est.berries)} <small className="muted">{m.sp.berry.name}</small></td><td>{fmt(m.est.ingCount)}</td>
        <td><small>{m.sp.skill?.modifierName || m.sp.skill?.name || m.sp.skill?.baseSkill?.name || '—'}</small></td><td>{fmt(m.est.skillTriggers)}</td></tr>)}
      <tr className="tot"><td>Total estimado</td><td>{fmt(tot('berries'))}</td><td>{fmt(tot('ingCount'))}</td><td /><td>{fmt(tot('skillTriggers'))}</td></tr></tbody></table></div>
    <p><b>Especialidades:</b> {list(spec)}</p>
    <p><b>Berries:</b> {list(berry)} — <b>sinergia:</b> {sameBerry(members) >= 3 ? 'boa (3+ iguais)' : sameBerry(members) === 2 ? 'média (2 iguais)' : 'baixa (todas diferentes)'}</p>
    <p className="muted">Valores diários são estimativas simplificadas (24h de ajuda, sem energia/inventário), a partir dos dados da SleepAPI.</p>
  </>
}
