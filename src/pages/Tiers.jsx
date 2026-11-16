import { useEffect, useMemo, useState } from 'react'
import { ISLANDS, ISLAND_LABEL, getPokemon, listPokemon } from '../services/sleepApi.js'
import { estimate, opts } from '../utils/calc.js'
import { Img, Sprite } from '../components/Ui.jsx'
const ROLES = { bal: 'Geral', berry: 'Berries', ing: 'Ingredientes', skill: 'Habilidades' }
const TIERS = [['S', 0.85], ['A', 0.7], ['B', 0.5], ['C', 0]]
// Para o tier, assume o ingrediente de maior valor (quantidade × valor) em cada nível.
const bestIng = sp => Object.fromEntries([0, 30, 60].map(k => [k, [...opts(sp, k)].sort((a, b) => b.amount * b.ingredient.value - a.amount * a.ingredient.value)[0]?.ingredient.name]))
export default function Tiers({ meta, mons }) {
  const [island, setIsland] = useState(ISLANDS[0]), [role, setRole] = useState('bal'), [level, setLevel] = useState(60), [finalOnly, setFinalOnly] = useState(true)
  const [sp, setSp] = useState([]), [msg, setMsg] = useState('Carregando…')
  useEffect(() => {
    let off = false
    setSp([]); setMsg('Carregando…')
    ;(async () => {
      try {
        const names = await listPokemon(island), out = []
        for (let i = 0; i < names.length; i += 8) {
          const r = await Promise.all(names.slice(i, i + 8).map(n => getPokemon(n).catch(() => null)))
          if (off) return
          out.push(...r.filter(Boolean))
        }
        setSp(out); setMsg(out.length < names.length ? `${names.length - out.length} espécie(s) não carregaram (erro da SleepAPI).` : '')
      } catch (e) { if (!off) setMsg('Não foi possível carregar a ilha: ' + e.message) }
    })()
    return () => { off = true }
  }, [island])
  const owned = useMemo(() => { const o = {}; mons.forEach(m => { o[m.species] = Math.max(o[m.species] || 0, m.level) }); return o }, [mons])
  const tiers = useMemo(() => {
    const rows = sp.filter(s => !finalOnly || s.remainingEvolutions === 0).map(s => { try { return { sp: s, est: estimate({ nature: 'Hardy', level, subskills: [], ing: bestIng(s), skillLevel: 1 }, s, meta.subs) } } catch { return null } }).filter(Boolean)
    const mx = k => Math.max(...rows.map(r => r.est[k]), 1e-9)
    rows.forEach(r => { const c = { berry: r.est.berryStrength / mx('berryStrength'), ing: r.est.ingStrength / mx('ingStrength'), skill: r.est.skillTriggers / mx('skillTriggers') }; r.score = role === 'bal' ? (c.berry + c.ing + c.skill) / 3 : c[role] })
    const top = Math.max(...rows.map(r => r.score), 1e-9)
    rows.forEach(r => { r.score /= top })
    return TIERS.map(([t, min], i) => ({ t, rows: rows.filter(r => r.score >= min && (i === 0 || r.score < TIERS[i - 1][1])).sort((a, b) => b.score - a.score) }))
  }, [sp, role, level, finalOnly])
  return <>
    <h1>Tiers por ilha</h1>
    <div className="card">
      <div className="chips">{ISLANDS.map(k => <button key={k} className={'chip' + (island === k ? ' on' : '')} onClick={() => setIsland(k)}><Img kind="island" name={k} size={22} /> {ISLAND_LABEL[k]}</button>)}</div>
      <div className="form" style={{ marginTop: 12 }}>
        <label>Papel<select value={role} onChange={e => setRole(e.target.value)}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label>Nível considerado<select value={level} onChange={e => setLevel(+e.target.value)}><option value={30}>30 (2 ingredientes)</option><option value={60}>60 (3 ingredientes)</option></select></label>
        <label className="chk"><input type="checkbox" checked={finalOnly} onChange={e => setFinalOnly(e.target.checked)} /> Só evolução final</label>
      </div>
      <p className="muted">Tier <b>estimado pelo app</b>, relativo a esta ilha (100% = melhor espécie dela no papel escolhido). S ≥ 85%, A ≥ 70%, B ≥ 50%, C abaixo. Usa produção diária simplificada, natureza neutra, sem sub-habilidades e o melhor ingrediente de cada nível. Não é ranking oficial. Ilha conforme o filtro da SleepAPI (Greengrass não tem filtro).</p>
      {msg && <p className="muted">{msg}</p>}
    </div>
    {tiers.map(({ t, rows }) => !!rows.length && <div key={t} className="card tier">
      <div className={'tlabel t-' + t}>{t}</div>
      <div className="grow">
        <div className="muted">{rows.length} espécie(s) · você tem {rows.filter(r => owned[r.sp.name]).length} · faltam {rows.filter(r => !owned[r.sp.name]).length}</div>
        <div className="tgrid">{rows.map(r => <div key={r.sp.name} className={'tcard' + (owned[r.sp.name] ? ' have' : '')}>
          <Sprite sp={r.sp} /><b>{r.sp.displayName || r.sp.name}</b>
          <span className="icons"><Img kind="berry" name={r.sp.berry.name} size={18} /><small className="muted">{Math.round(r.score * 100)}%</small></span>
          <small className={owned[r.sp.name] ? 'ok' : 'miss'}>{owned[r.sp.name] ? `✔ Nv ${owned[r.sp.name]}` : 'Falta'}</small>
        </div>)}</div>
      </div>
    </div>)}
  </>
}
