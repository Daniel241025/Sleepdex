import { MonLine } from '../components/Ui.jsx'
export default function Dashboard({ mons, teams, species }) {
  const last = teams[0]
  return <>
    <h1>Dashboard</h1>
    <div className="grid">
      <div className="card"><div className="big">{mons.length}</div><div className="muted">Pokémon cadastrados</div></div>
      <div className="card"><div className="big">{teams.length}</div><div className="muted">Equipes salvas</div></div>
      <div className="card cta"><b>Otimizador automático</b><p className="muted">Sugere a melhor equipe de 5 entre os seus Pokémon.</p><a className="btn" href="#/otimizador">Abrir otimizador</a></div>
    </div>
    <div className="card"><h2>Última equipe montada</h2>
      {last ? <><p className="muted">{last.name} · {new Date(last.date).toLocaleString('pt-BR')}</p>
        {last.ids.map(id => mons.find(m => m.id === id)).filter(Boolean).map(m => <MonLine key={m.id} mon={m} sp={species[m.species]} />)}</>
        : <p className="muted">Nenhuma equipe ainda. <a href="#/equipe">Montar equipe</a></p>}
    </div>
    <div className="card"><h2>Resumo das equipes</h2>
      {teams.length ? teams.map(t => <div key={t.id} className="monline"><b>{t.name}</b><span className="muted">{t.ids.length} integrantes · {new Date(t.date).toLocaleDateString('pt-BR')}</span></div>) : <p className="muted">Sem equipes salvas.</p>}
    </div>
  </>
}
