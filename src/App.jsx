import { useEffect, useMemo, useState } from "react";
import { loadMeta, getPokemon } from "./services/sleepApi.js";
import { useLocal } from "./services/storage.js";
import { estimate } from "./utils/calc.js";
import MyPokemon from "./pages/MyPokemon.jsx";
import Team from "./pages/Team.jsx";
import Compare from "./pages/Compare.jsx";
import Explore from "./pages/Explore.jsx";
import Tiers from "./pages/Tiers.jsx";
import Natures from "./pages/Natures.jsx";
import Potential from "./pages/Potential.jsx";

const PAGES = [
  ["time", "Montar Time"],
  ["pokemon", "Meus Pokémon"],
  ["explorar", "Explorar"],
  ["tiers", "Tiers por ilha"],
  ["natureza", "Natureza ideal"],
  ["potencial", "Onde gastar doces"],
  ["comparar", "Comparar"],
];
const useRoute = () => {
  const get = () => location.hash.replace("#/", "") || "time";
  const [r, set] = useState(get);
  useEffect(() => {
    const f = () => {
      set(get());
      window.scrollTo(0, 0);
    };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  return r;
};

export default function App() {
  const route = useRoute();
  const [mons, setMons] = useLocal("sleepdex:mons", []);
  const [teams, setTeams] = useLocal("sleepdex:teams", []);
  const [meta, setMeta] = useState(null),
    [err, setErr] = useState("");
  const [species, setSpecies] = useState({}),
    [failed, setFailed] = useState({});
  useEffect(() => {
    loadMeta()
      .then(setMeta)
      .catch((e) => setErr(e.message));
  }, []);
  const speciesKey = [...new Set(mons.map((m) => m.species))].join();
  const load = (n) =>
    getPokemon(n)
      .then((d) => {
        setSpecies((x) => ({ ...x, [n]: d }));
        setFailed((f) => {
          const y = { ...f };
          delete y[n];
          return y;
        });
      })
      .catch((e) => setFailed((f) => ({ ...f, [n]: e.message })));
  useEffect(() => {
    speciesKey
      .split(",")
      .filter((n) => n && !species[n] && !failed[n])
      .forEach(load);
  }, [speciesKey]);
  const items = useMemo(
    () =>
      meta
        ? mons
            .filter((m) => species[m.species])
            .map((m) => ({
              mon: m,
              sp: species[m.species],
              est: estimate(m, species[m.species], meta.subs),
            }))
        : [],
    [mons, species, meta],
  );
  const props = { mons, setMons, teams, setTeams, meta, species, items };
  const Page =
    {
      time: Team,
      pokemon: MyPokemon,
      explorar: Explore,
      tiers: Tiers,
      natureza: Natures,
      potencial: Potential,
      comparar: Compare,
    }[route] || Team;
  return (
    <div className="app">
      <header>
        <nav>
          <div className="logo">
            🌙 Sleep<b>Dex</b>
          </div>
          {PAGES.map(([k, l]) => (
            <a key={k} href={"#/" + k} className={route === k ? "on" : ""}>
              {l}
            </a>
          ))}
        </nav>
      </header>
      <main>
        {Object.keys(failed).length > 0 && (
          <div className="notice">
            Não consegui carregar dados de{" "}
            <b>{Object.keys(failed).join(", ")}</b> (a SleepAPI respondeu com
            erro). Esses Pokémon ficam fora dos cálculos por enquanto; o resto
            funciona normalmente.{" "}
            <button
              className="btn ghost"
              onClick={() => Object.keys(failed).forEach(load)}
            >
              Tentar de novo
            </button>
          </div>
        )}
        {err && (
          <div className="error">
            ⚠️ Não consegui carregar a lista de dados da SleepAPI: {err}. Seus
            dados salvos continuam no navegador; tente recarregar a página.
          </div>
        )}
        {!meta && !err ? (
          <p className="muted">Carregando dados da SleepAPI…</p>
        ) : (
          meta && <Page {...props} />
        )}
      </main>
    </div>
  );
}
