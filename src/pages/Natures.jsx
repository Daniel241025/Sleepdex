import { useMemo, useState } from "react";
import { NATURES, natDesc } from "../data/natures.js";
import { estimate, fmt } from "../utils/calc.js";
import { MonLine } from "../components/Ui.jsx";
const ALL = ["Hardy", ...Object.keys(NATURES)]; // Hardy = neutra (as outras neutras são equivalentes)
const FOCUS = {
  auto: "Automático (pela especialidade)",
  bal: "Geral",
  berry: "Berries",
  ing: "Ingredientes",
  skill: "Habilidades",
};
const AUTO = { berry: "berry", ingredient: "ing", skill: "skill" };
const r = (a, b) => (b > 0 ? a / b : 1);
const gain = (e, b, f) =>
  f === "berry"
    ? r(e.berryStrength, b.berryStrength)
    : f === "ing"
      ? r(e.ingStrength, b.ingStrength)
      : f === "skill"
        ? r(e.skillTriggers, b.skillTriggers)
        : (r(e.berryStrength, b.berryStrength) +
            r(e.ingStrength, b.ingStrength) +
            r(e.skillTriggers, b.skillTriggers)) /
          3;
export default function Natures({ items, meta }) {
  const [focus, setFocus] = useState("auto");
  const rows = useMemo(
    () =>
      items.map(({ mon, sp, est }) => {
        const f = focus === "auto" ? AUTO[sp.specialty] || "bal" : focus;
        const ranked = ALL.map((n) => ({
          n,
          g: gain(estimate({ ...mon, nature: n }, sp, meta.subs), est, f),
        })).sort((a, b) => b.g - a.g);
        const best = ranked[0],
          cur = NATURES[mon.nature] ? mon.nature : "Hardy";
        return {
          mon,
          sp,
          f,
          best,
          top: ranked.slice(0, 3),
          pct: (best.g - 1) * 100,
          same: best.n === cur || best.g - 1 < 0.005,
        };
      }),
    [items, focus],
  );
  return (
    <>
      <h1>Natureza ideal</h1>
      <div className="card">
        <label style={{ maxWidth: 320 }}>
          Otimizar para
          <select value={focus} onChange={(e) => setFocus(e.target.value)}>
            {Object.entries(FOCUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <p className="muted">
          Compara as 21 naturezas com efeito (mais a neutra) usando as mesmas
          estimativas do app e mostra quanto a produção diária mudaria em
          relação à natureza atual. <b>Limitação:</b> o app só considera
          velocidade de ajuda, busca de ingredientes e chance de habilidade;{" "}
          <b>recuperação de energia e EXP não entram na conta</b>, mas importam
          no jogo. Trate como dica, não como regra.
        </p>
      </div>
      <div className="card">
        {!rows.length && (
          <p className="muted">Cadastre Pokémon em “Meus Pokémon” primeiro.</p>
        )}
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Pokémon</th>
                <th>Natureza atual</th>
                <th>Mais indicada</th>
                <th>Ganho estimado</th>
              </tr>
            </thead>
            <tbody>
              {rows
                .sort((a, b) => b.pct - a.pct)
                .map((x) => (
                  <tr key={x.mon.id}>
                    <td>
                      <MonLine mon={x.mon} sp={x.sp} />
                    </td>
                    <td>
                      <b>{x.mon.nature}</b>
                      <div className="muted">{natDesc(x.mon.nature)}</div>
                    </td>
                    <td>
                      {x.same ? (
                        <span className="ok">✔ Já está entre as melhores</span>
                      ) : (
                        <>
                          <b>{x.best.n}</b>
                          <div className="muted">{natDesc(x.best.n)}</div>
                          {x.top.slice(1).map((t) => (
                            <small key={t.n} className="muted">
                              também: {t.n}{" "}
                            </small>
                          ))}
                        </>
                      )}
                    </td>
                    <td className={x.same ? "muted" : x.pct >= 5 ? "best" : ""}>
                      {x.same ? "—" : `+${fmt(x.pct)}%`}
                      <div className="muted">
                        {x.same
                          ? ""
                          : x.pct >= 5
                            ? "vale considerar trocar"
                            : "ganho pequeno"}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
