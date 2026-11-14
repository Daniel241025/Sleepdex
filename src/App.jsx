import { useEffect, useMemo, useState } from 'react'
import { loadMeta, getPokemon } from './services/sleepApi.js'
import { useLocal } from './services/storage.js'
import { estimate } from './utils/calc.js'
import MyPokemon from './pages/MyPokemon.jsx'
import Team from './pages/Team.jsx'
import Compare from './pages/Compare.jsx'

const PAGES = [['time', 'Montar Time'], ['pokemon', 'Meus Pokémon'], ['comparar', 'Comparar']]
const useRoute = () => {
  const get = () => location.hash.replace('#/', '') || 'time'
  const [r, set] = useState(get)
  useEffect(() => { const f = () => { set(get()); window.scrollTo(0, 0) }; addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])
  return r
}

export default function App() {
  const route = useRoute()
  const [mons, setMons] = useLocal('sleepdex:mons', [])
  const [teams, setTeams] = useLocal('sleepdex:teams', [])
  const [meta, setMeta] = useState(null), [err, setErr] = useState('')
  const [species, setSpecies] = useState({})
  useEffect(() => { loadMeta().then(setMeta).catch(e => setErr(e.message)) }, [])
  const speciesKey = [...new Set(mons.map(m => m.species))].join()
  useEffect(() => {
    speciesKey.split(',').filter(n => n && !species[n]).forEach(n => getPokemon(n).then(d => setSpecies(s => ({ ...s, [n]: d }))).catch(e => setErr(e.message)))
  }, [speciesKey])
  const items = useMemo(() => meta ? mons.filter(m => species[m.species]).map(m => ({ mon: m, sp: species[m.species], est: estimate(m, species[m.species], meta.subs) })) : [], [mons, species, meta])
  const props = { mons, setMons, teams, setTeams, meta, species, items }
  const Page = { time: Team, pokemon: MyPokemon, comparar: Compare }[route] || Team
  return <div className="app">
    <header><nav><div className="logo">🌙 Sleep<b>Dex</b></div>{PAGES.map(([k, l]) => <a key={k} href={'#/' + k} className={route === k ? 'on' : ''}>{l}</a>)}</nav></header>
    <main>
      {err && <div className="error">⚠️ SleepAPI indisponível ou bloqueada: {err}. Seus dados salvos continuam no navegador; tente recarregar a página.</div>}
      {!meta && !err ? <p className="muted">Carregando dados da SleepAPI…</p> : meta && <Page {...props} />}
    </main>
  </div>
}
