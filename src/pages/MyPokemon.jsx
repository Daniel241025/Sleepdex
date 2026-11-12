import { useEffect, useState } from 'react'
import { getPokemon } from '../services/sleepApi.js'
import { SUB_LEVELS, opts } from '../utils/calc.js'
import { MonLine } from '../components/Ui.jsx'
const empty = { name: '', species: '', level: 30, nature: 'Hardy', subskills: ['', '', '', '', ''], ing: {}, skillLevel: 1 }
export default function MyPokemon({ mons, setMons, meta, species }) {
  const [f, setF] = useState(empty), [editId, setEditId] = useState(null), [sp, setSp] = useState(null)
  useEffect(() => { setSp(null); if (f.species) getPokemon(f.species).then(setSp).catch(() => {}) }, [f.species])
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const setSub = (i, v) => setF(x => ({ ...x, subskills: x.subskills.map((s, j) => (j === i ? v : s)) }))
  const save = e => {
    e.preventDefault()
    if (!f.species) return
    const m = { ...f, level: +f.level, skillLevel: +f.skillLevel, id: editId || crypto.randomUUID(), name: f.name.trim() || sp?.displayName || f.species, subskills: f.subskills.filter(Boolean) }
    setMons(editId ? mons.map(x => (x.id === editId ? m : x)) : [...mons, m]); setF(empty); setEditId(null)
  }
  const edit = m => { setEditId(m.id); setF({ ...m, subskills: [...m.subskills, '', '', '', '', ''].slice(0, 5) }); window.scrollTo(0, 0) }
  const maxSk = sp?.skill?.RP?.length || 7
  return <>
    <h1>Meus Pokémon</h1>
    <form className="card form" onSubmit={save}>
      <h2>{editId ? 'Editar Pokémon' : 'Novo Pokémon'}</h2>
      <label>Espécie<select required value={f.species} onChange={e => set('species', e.target.value)}><option value="">Selecione…</option>{meta.list.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Apelido (opcional)<input value={f.name} onChange={e => set('name', e.target.value)} /></label>
      <label>Nível<input type="number" min="1" max="100" value={f.level} onChange={e => set('level', e.target.value)} /></label>
      <label>Natureza<select value={f.nature} onChange={e => set('nature', e.target.value)}>{meta.natures.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Nível da habilidade principal<input type="number" min="1" max={maxSk} value={f.skillLevel} onChange={e => set('skillLevel', e.target.value)} /></label>
      <div className="muted">Habilidade principal: {sp ? (sp.skill?.modifierName || sp.skill?.name || sp.skill?.baseSkill?.name || '—') : 'escolha a espécie'}</div>
      {SUB_LEVELS.map((l, i) => <label key={l}>Sub-habilidade (Nv {l})<select value={f.subskills[i]} onChange={e => setSub(i, e.target.value)}><option value="">—</option>{Object.keys(meta.subs).map(n => <option key={n}>{n}</option>)}</select></label>)}
      {sp && [0, 30, 60].map(k => <label key={k}>Ingrediente (Nv {k || 1}){+f.level < k ? ' — bloqueado' : ''}
        <select disabled={+f.level < k} value={f.ing[k] || ''} onChange={e => set('ing', { ...f.ing, [k]: e.target.value })}>
          <option value="">Padrão (primeiro)</option>{opts(sp, k).map(o => <option key={o.ingredient.name} value={o.ingredient.name}>{o.ingredient.longName} ×{o.amount}</option>)}</select></label>)}
      <div><button className="btn">{editId ? 'Salvar alterações' : 'Cadastrar'}</button>{editId && <button type="button" className="btn ghost" onClick={() => { setF(empty); setEditId(null) }}>Cancelar</button>}</div>
    </form>
    <div className="card"><h2>Cadastrados ({mons.length})</h2>
      {!mons.length && <p className="muted">Nada cadastrado ainda.</p>}
      {mons.map(m => <MonLine key={m.id} mon={m} sp={species[m.species]}>
        <button className="btn ghost" onClick={() => edit(m)}>Editar</button>
        <button className="btn ghost" onClick={() => confirm(`Remover ${m.name}?`) && setMons(mons.filter(x => x.id !== m.id))}>Remover</button></MonLine>)}
    </div>
  </>
}
