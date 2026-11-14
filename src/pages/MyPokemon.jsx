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
  const [txt, setTxt] = useState(''), [imp, setImp] = useState(null)
  const parse = async raw => {
    let arr
    try { arr = JSON.parse(raw) } catch { return setImp({ ok: [], bad: ['O texto não é um JSON válido.'], warn: [] }) }
    if (!Array.isArray(arr)) arr = [arr]
    const ok = [], bad = [], warn = []
    const subNames = Object.keys(meta.subs)
    arr.forEach((p, i) => {
      const norm = x => String(x || '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean).sort().join('')
      const species = meta.list.find(n => norm(n) === norm(p?.species)) || '', label = p?.name || p?.species || `#${i + 1}`
      if (!species) return bad.push(`${label}: espécie "${p?.species ?? ''}" não encontrada na SleepAPI (cadastre à mão)`)
      const level = Math.round(+p.level)
      if (!(level >= 1 && level <= 100)) return bad.push(`${label}: nível inválido`)
      const nature = meta.natures.find(n => n.toLowerCase() === String(p.nature || '').toLowerCase())
      if (!nature) warn.push(`${label}: natureza "${p.nature ?? ''}" não reconhecida, usei Hardy (neutra)`)
      const subskills = []
      ;(Array.isArray(p.subskills) ? p.subskills : []).slice(0, 5).forEach(x => {
        const n = subNames.find(y => y.toLowerCase() === String(x).toLowerCase())
        n ? subskills.push(n) : warn.push(`${label}: sub-habilidade "${x}" não reconhecida, ignorada`)
      })
      const ing = {}
      ;[0, 30, 60].forEach(k => { if (p.ing?.[k]) ing[k] = String(p.ing[k]) })
      ok.push({ id: crypto.randomUUID(), name: String(p.name || species.charAt(0) + species.slice(1).toLowerCase()), species, level, nature: nature || 'Hardy', subskills, ing, _q: p.ingQty, skillLevel: Math.min(7, Math.max(1, Math.round(+p.skillLevel) || 1)) })
    })
    await Promise.all(ok.map(async m => {
      try {
        const sp = await getPokemon(m.species), q = m._q || {}
        for (const k of [0, 30, 60]) {
          const raw = m.ing[k]; if (!raw) continue
          const x = raw.toLowerCase()
          const o = opts(sp, k).filter(z => z.ingredient.name.toLowerCase() === x || z.ingredient.longName.toLowerCase().includes(x))
          const pick = o.find(z => !q[k] || z.amount === +q[k]) || o[0]
          if (!pick) { warn.push(`${m.name}: ${raw} não é opção do nível ${k || 1} desta espécie, usei o padrão`); delete m.ing[k] }
          else { m.ing[k] = pick.ingredient.name; if (q[k] && pick.amount !== +q[k]) warn.push(`${m.name}: ${raw} ×${q[k]} no jogo, mas a API indica ×${pick.amount} (nível ${k || 1}); confira`) }
        }
      } catch { warn.push(`${m.name}: não consegui validar os ingredientes na SleepAPI`) }
      delete m._q
    }))
    setImp({ ok, bad, warn })
  }
  const onFile = e => { const f = e.target.files[0]; if (f) f.text().then(parse); e.target.value = '' }
  const confirmImport = () => { setMons([...mons.filter(m => !imp.ok.some(n => n.name === m.name && n.species === m.species && n.level === m.level)), ...imp.ok]); setImp(null); setTxt('') }
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
    <div className="card"><h2>Importar Pokémon</h2>
      <p className="muted">Escolha um arquivo .json ou cole o texto. Nada é salvo até você confirmar.</p>
      <input type="file" accept=".json,application/json" onChange={onFile} />
      <textarea rows="4" placeholder="Ou cole o JSON aqui" value={txt} onChange={e => setTxt(e.target.value)} style={{ width: '100%', margin: '8px 0', background: '#0e1a40', color: 'inherit', border: '1px solid var(--line)', borderRadius: 10, padding: 9 }} />
      <button className="btn ghost" disabled={!txt.trim()} onClick={() => parse(txt)}>Ler texto</button>
      {imp && <div>
        {!!imp.ok.length && <><p><b>Prontos para importar ({imp.ok.length}):</b></p>{imp.ok.map(m => <div key={m.id} className="muted">{m.name} · {m.species} · Nv {m.level} · {m.nature} · {m.subskills.join(', ') || 'sem sub-habilidades'}</div>)}</>}
        {imp.warn.map((w, i) => <p key={i} className="muted">⚠️ {w}</p>)}
        {imp.bad.map((w, i) => <p key={i} className="error">Ignorado — {w}</p>)}
        {!!imp.ok.length && <button className="btn" onClick={confirmImport}>Importar {imp.ok.length} Pokémon</button>}
        <button className="btn ghost" onClick={() => setImp(null)}>Cancelar</button>
      </div>}
      <details><summary>Formato do arquivo</summary><pre className="muted" style={{ overflowX: 'auto' }}>{`[
  {
    "name": "Meu Pikachu",
    "species": "PIKACHU",
    "level": 45,
    "nature": "Adamant",
    "subskills": ["Helping Speed S", "Berry Finding S", "Skill Trigger M"],
    "ing": { "0": "Apple", "30": "Honey" },
    "skillLevel": 4
  }
]`}</pre></details>
    </div>
  </>
}
