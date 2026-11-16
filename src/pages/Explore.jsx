import { useEffect, useMemo, useState } from "react";
import {
  ISLANDS,
  ISLAND_LABEL,
  getPokemon,
  listPokemon,
} from "../services/sleepApi.js";
import { estimate, fmt, opts } from "../utils/calc.js";
import { Img, Sprite, SPEC } from "../components/Ui.jsx";
const SORTS = {
  berryStrength: "Força de berries",
  ingStrength: "Força de ingredientes",
  skillTriggers: "Ativações de habilidade",
  helps: "Ajudas por dia",
};
export default function Explore({ meta }) {
  const [data, setData] = useState({}),
    [done, setDone] = useState(0),
    [fail, setFail] = useState(0);
  const [q, setQ] = useState(""),
    [island, setIsland] = useState(""),
    [inIsland, setInIsland] = useState(null);
  const [spec, setSpec] = useState(""),
    [berry, setBerry] = useState(""),
    [sort, setSort] = useState("berryStrength"),
    [level, setLevel] = useState(60),
    [limit, setLimit] = useState(36);
  useEffect(() => {
    let off = false;
    (async () => {
      const names = meta.list;
      for (let i = 0; i < names.length; i += 8) {
        const res = await Promise.all(
          names.slice(i, i + 8).map((n) =>
            getPokemon(n)
              .then((d) => [n, d])
              .catch(() => [n, null]),
          ),
        );
        if (off) return;
        setData((d) => {
          const x = { ...d };
          res.forEach(([n, v]) => {
            if (v) x[n] = v;
          });
          return x;
        });
        setDone(Math.min(names.length, i + 8));
        setFail((f) => f + res.filter((r) => !r[1]).length);
      }
    })();
    return () => {
      off = true;
    };
  }, []);
  useEffect(() => {
    if (!island) return setInIsland(null);
    listPokemon(island)
      .then(setInIsland)
      .catch(() => setInIsland(null));
  }, [island]);
  const all = Object.values(data);
  const specs = [...new Set(all.map((s) => s.specialty))],
    berries = [
      ...new Set(all.map((s) => s.berry?.name).filter(Boolean)),
    ].sort();
  const rows = useMemo(
    () =>
      all
        .map((sp) => {
          try {
            return {
              sp,
              est: estimate(
                {
                  nature: "Hardy",
                  level,
                  subskills: [],
                  ing: {},
                  skillLevel: 1,
                },
                sp,
                meta.subs,
              ),
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .filter(
          (r) =>
            (!q ||
              (r.sp.displayName || r.sp.name)
                .toLowerCase()
                .includes(q.toLowerCase())) &&
            (!inIsland || inIsland.includes(r.sp.name)) &&
            (!spec || r.sp.specialty === spec) &&
            (!berry || r.sp.berry.name === berry),
        )
        .sort((a, b) => b.est[sort] - a.est[sort]),
    [data, level, q, inIsland, spec, berry, sort],
  );
  const loading = done < meta.list.length;
  return (
    <>
      <h1>Explorar espécies</h1>
      <div className="card">
        {loading && (
          <p className="muted">
            Carregando espécies da SleepAPI… {done}/{meta.list.length}
          </p>
        )}
        {!loading && fail > 0 && (
          <p className="muted">
            {fail} espécie(s) não carregaram (erro da SleepAPI) e não aparecem
            aqui.
          </p>
        )}
        <div className="form">
          <label>
            Buscar
            <input
              placeholder="Nome do Pokémon"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(36);
              }}
            />
          </label>
          <label>
            Ilha
            <select value={island} onChange={(e) => setIsland(e.target.value)}>
              <option value="">Todas</option>
              {ISLANDS.map((k) => (
                <option key={k} value={k}>
                  {ISLAND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Especialidade
            <select value={spec} onChange={(e) => setSpec(e.target.value)}>
              <option value="">Todas</option>
              {specs.map((s) => (
                <option key={s} value={s}>
                  {SPEC[s] || s}
                </option>
              ))}
            </select>
          </label>
          <label>
            Berry
            <select value={berry} onChange={(e) => setBerry(e.target.value)}>
              <option value="">Todas</option>
              {berries.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            Ordenar por
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nível considerado
            <select value={level} onChange={(e) => setLevel(+e.target.value)}>
              <option value={1}>1 (1 ingrediente)</option>
              <option value={30}>30 (2 ingredientes)</option>
              <option value={60}>60 (3 ingredientes)</option>
            </select>
          </label>
        </div>
        <p className="muted">
          {rows.length} espécies. Valores diários estimados (natureza neutra,
          sem sub-habilidades, 24h de ajuda), úteis só para comparar espécies
          entre si.
        </p>
      </div>
      <div className="xgrid">
        {rows.slice(0, limit).map(({ sp, est }, i) => {
          const ing = [
            ...new Set(
              [0, 30, 60].flatMap((k) =>
                opts(sp, k).map((o) => o.ingredient.name),
              ),
            ),
          ];
          const ev = (sp.evolvesInto || [])
            .map((e) => (typeof e === "string" ? e : e?.name || e?.pokemon))
            .filter(Boolean);
          return (
            <div key={sp.name} className="card xcard">
              <div className="xhead">
                <Sprite sp={sp} />
                <div>
                  <b>{sp.displayName || sp.name}</b>
                  <div className="muted">
                    #{sp.pokedexNumber} · {SPEC[sp.specialty] || sp.specialty}
                  </div>
                </div>
                <span className="rank">{i + 1}º</span>
              </div>
              <div className="icons">
                <Img kind="berry" name={sp.berry.name} size={26} />
                <small className="muted">{sp.berry.name}</small>
                <span className="grow" />
                {ing.map((n) => (
                  <Img key={n} kind="ing" name={n} size={24} />
                ))}
              </div>
              <div className="xstats">
                <div>
                  <b>{fmt(est.berries)}</b>
                  <span>berries/dia</span>
                </div>
                <div>
                  <b>{fmt(est.ingCount)}</b>
                  <span>ingred./dia</span>
                </div>
                <div>
                  <b>{fmt(est.skillTriggers)}</b>
                  <span>habilid./dia</span>
                </div>
              </div>
              <div className="muted">
                Habilidade:{" "}
                {sp.skill?.modifierName ||
                  sp.skill?.name ||
                  sp.skill?.baseSkill?.name ||
                  "—"}
              </div>
              <div className="muted">
                {ev.length
                  ? `Evolui para ${ev.join(", ")}`
                  : sp.remainingEvolutions > 0
                    ? `${sp.remainingEvolutions} evolução(ões) restante(s)`
                    : "Sem mais evoluções"}
              </div>
            </div>
          );
        })}
      </div>
      {rows.length > limit && (
        <button className="btn ghost" onClick={() => setLimit((l) => l + 36)}>
          Mostrar mais ({rows.length - limit})
        </button>
      )}
    </>
  );
}
