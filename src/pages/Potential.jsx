import { useMemo } from "react";
import { estimate, fmt } from "../utils/calc.js";
import { MonLine } from "../components/Ui.jsx";
const value = (e) => e.berryStrength + e.ingStrength; // valor diário = força de berries + força de ingredientes (habilidades não entram)
export default function Potential({ items, meta }) {
  const { rows, maxed } = useMemo(() => {
    const rows = items
      .filter((i) => i.mon.level < 60)
      .map(({ mon, sp, est }) => {
        const ms = [30, 60]
          .filter((L) => L > mon.level)
          .map((L) => {
            const e = estimate({ ...mon, level: L }, sp, meta.subs);
            return {
              L,
              left: L - mon.level,
              pct: (value(e) / value(est) - 1) * 100,
              ing: e.ingCount / (est.ingCount || 1),
            };
          });
        return { mon, sp, ms, score: ms[0].pct / ms[0].left };
      })
      .sort((a, b) => b.score - a.score);
    return { rows, maxed: items.length - rows.length };
  }, [items]);
  return (
    <>
      <h1>Onde gastar doces</h1>
      <div className="card">
        <p className="muted">
          Mostra quanto a produção diária sobe quando cada Pokémon chega ao{" "}
          <b>nível 30</b> (2º ingrediente) e ao <b>nível 60</b> (3º
          ingrediente), e ordena pelo ganho por nível até o próximo marco.
          “Valor diário” = força de berries + força de ingredientes, em
          estimativa simplificada (habilidades não entram). Os ingredientes
          novos usam a sua escolha em “Meus Pokémon” ou, se ainda não escolheu,
          a primeira opção da espécie. Sub-habilidades já preenchidas nos slots
          seguintes também entram quando o nível as libera.
        </p>
      </div>
      <div className="card">
        {!items.length && (
          <p className="muted">Cadastre Pokémon em “Meus Pokémon” primeiro.</p>
        )}
        {!!items.length && !rows.length && (
          <p className="muted">
            Todos os seus Pokémon já estão no nível 60 ou mais.
          </p>
        )}
        {!!rows.length && (
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th>Pokémon</th>
                  <th>Próximo marco</th>
                  <th>Depois, nível 60</th>
                  <th>Ganho por nível</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.mon.id}>
                    <td>
                      <MonLine mon={x.mon} sp={x.sp} />
                    </td>
                    <td>
                      <b>Nv {x.ms[0].L}</b>{" "}
                      <span className="muted">(faltam {x.ms[0].left})</span>
                      <div className="best">+{fmt(x.ms[0].pct)}%</div>
                      <div className="muted">
                        ingredientes ×{fmt(x.ms[0].ing)}
                      </div>
                    </td>
                    <td>
                      {x.ms[1] ? (
                        <>
                          <b>Nv 60</b>{" "}
                          <span className="muted">(faltam {x.ms[1].left})</span>
                          <div className="best">+{fmt(x.ms[1].pct)}%</div>
                          <div className="muted">
                            ingredientes ×{fmt(x.ms[1].ing)}
                          </div>
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      <b>+{fmt(x.score)}%</b>
                      <div className="muted">por nível</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {maxed > 0 && (
          <p className="muted">
            {maxed} Pokémon já estão no nível 60 ou mais e não aparecem aqui.
          </p>
        )}
      </div>
    </>
  );
}
