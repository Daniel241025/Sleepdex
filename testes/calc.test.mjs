// Rodar: npm test   (usa o test runner do Node, sem dependências)
// Fixture: dados REAIS de GET /api/pokemon/DARKRAI (frequência, chances, berry, habilidade e ingredientes).
import test from "node:test";
import assert from "node:assert/strict";
import {
  nm,
  subFx,
  estimate,
  coverage,
  rank,
  bestTeam,
  analyze,
  SUB_LEVELS,
} from "../src/utils/calc.js";
const ing = (name, value) => ({ name, value, longName: name });
const D = {
  name: "DARKRAI",
  frequency: 2900,
  ingredientPercentage: 19.2,
  skillPercentage: 2.3,
  berry: { name: "WIKI", value: 31, type: "dark" },
  specialty: "all",
  remainingEvolutions: 0,
  skill: { strengthAmounts: [2640, 3753, 5178, 7149, 9870, 13638, 18515] },
  ingredient0: [
    { amount: 2, ingredient: ing("Sausage", 103) },
    { amount: 2, ingredient: ing("Apple", 90) },
  ],
  ingredient30: [
    { amount: 0, ingredient: ing("Locked", 0) },
    { amount: 4, ingredient: ing("Sausage", 103) },
    { amount: 5, ingredient: ing("Apple", 90) },
  ],
  ingredient60: [
    { amount: 0, ingredient: ing("Locked", 0) },
    { amount: 6, ingredient: ing("Sausage", 103) },
    { amount: 7, ingredient: ing("Apple", 90) },
  ],
};
const SUBS = {
  "Berry Finding S": { amount: 1 },
  "Helping Speed M": { amount: 0.14 },
  "Ingredient Finder M": { amount: 0.36 },
  "Skill Trigger M": { amount: 0.36 },
}; // só Berry Finding S é real; os % são hipotéticos
const mon = (o = {}) => ({
  id: "x",
  name: "x",
  species: "DARKRAI",
  level: 35,
  nature: "Hardy",
  subskills: [],
  ing: {},
  skillLevel: 1,
  ...o,
});
const close = (a, b, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("natureza: efeitos e neutras", () => {
  close(nm("Adamant", "sp"), 0.9);
  close(nm("Adamant", "in"), 0.8);
  close(nm("Adamant", "sk"), 1);
  close(nm("Calm", "sk"), 1.2);
  close(nm("Hardy", "sp"), 1);
  close(nm("Inexistente", "sp"), 1);
});
test("sub-habilidades liberam em 10/25/50/70/80", () => {
  assert.deepEqual(SUB_LEVELS, [10, 25, 50, 70, 80]);
  const subs = [
    "Helping Speed M",
    "Ingredient Finder M",
    "Skill Trigger M",
    "Berry Finding S",
    "Helping Speed M",
  ];
  close(subFx(mon({ level: 9, subskills: subs }), SUBS).speed, 0);
  close(subFx(mon({ level: 10, subskills: subs }), SUBS).speed, 0.14);
  close(subFx(mon({ level: 44, subskills: subs }), SUBS).ing, 0.36); // 2 liberadas
  close(subFx(mon({ level: 44, subskills: subs }), SUBS).skill, 0); // a 3ª só abre no 50
  close(subFx(mon({ level: 80, subskills: subs }), SUBS).speed, 0.28); // 5 liberadas: 2x Helping Speed M
  close(subFx(mon({ level: 80, subskills: subs }), SUBS).berry, 1);
  close(
    subFx(mon({ level: 80, subskills: ["Helping Speed M"] }), {
      "Helping Speed M": { amount: 14 },
    }).speed,
    0.14,
  ); // % guardado como 14
});
test("estimativa base (Darkrai nv35, neutro, sem sub-habilidades)", () => {
  const e = estimate(mon(), D, SUBS),
    helps = 86400 / 2900;
  close(e.helps, helps);
  close(e.berries, helps * (1 - 0.192));
  close(e.berryStrength, helps * (1 - 0.192) * 31);
  close(e.ingCount, helps * 0.192 * 3); // nv35: slots 1 e 2 → (2+4)/2
  close(e.by.Sausage, helps * 0.192 * 3);
  close(e.skillTriggers, helps * 0.023);
  close(e.skillStrength, helps * 0.023 * 2640);
});
test("nível libera slots de ingrediente 30 e 60", () => {
  const a = estimate(mon({ level: 29 }), D, SUBS),
    b = estimate(mon({ level: 30 }), D, SUBS),
    c = estimate(mon({ level: 60 }), D, SUBS),
    h = (86400 / 2900) * 0.192;
  close(a.ingCount, h * 2);
  close(b.ingCount, h * 3);
  close(c.ingCount, h * 4); // (2) · (2+4)/2 · (2+4+6)/3
});
test("natureza e sub-habilidades alteram a produção", () => {
  const base = estimate(mon(), D, SUBS),
    h = 86400 / 2900;
  const adamant = estimate(mon({ nature: "Adamant" }), D, SUBS); // ajuda +11,1%, ingrediente -20%
  close(adamant.helps, h / 0.9);
  close(adamant.ingCount, (h / 0.9) * 0.192 * 0.8 * 3);
  const sub = estimate(
    mon({ level: 25, subskills: ["Helping Speed M", "Berry Finding S"] }),
    D,
    SUBS,
  );
  close(sub.helps, h / (1 - 0.14));
  close(sub.berries, sub.helps * (1 - 0.192) * 2); // Berry Finding S: +1 berry
  assert.ok(base.berryStrength < sub.berryStrength);
});
test("escolha de ingrediente pelo nome", () => {
  const e = estimate(mon({ ing: { 0: "Apple", 30: "Apple" } }), D, SUBS),
    h = (86400 / 2900) * 0.192;
  close(e.by.Apple, h * 3.5);
  assert.equal(e.by.Sausage, undefined); // Apple: ×2 no slot 1 e ×5 no slot 2 → média 3,5
});
test("cobertura da receita-alvo", () => {
  const m = [{ est: estimate(mon(), D, SUBS) }],
    got = m[0].est.by.Sausage;
  const c = coverage(m, { Sausage: got * 2, Apple: 0, Milk: 5 });
  assert.equal(c.length, 2);
  assert.equal(c[0].k, "Sausage");
  close(c[0].pct, 0.5);
  assert.equal(c[1].pct, 0);
  close(coverage(m, { Sausage: got / 2 })[0].pct, 1); // limitado a 100%
});
const variant = (name, o) => ({
  ...D,
  name,
  berry: { ...D.berry, name: o.berry || "WIKI" },
  ...o,
});
const team = (specs, ml = {}) =>
  specs.map((s, i) => {
    const sp = variant("S" + i, s),
      m = mon({ id: "m" + i, species: sp.name, ...ml });
    return { mon: m, sp, est: estimate(m, sp, SUBS) };
  });
test("ranking: melhor da lista tem nota 1 no foco", () => {
  const items = team([
    { frequency: 2000 },
    { frequency: 3000 },
    { frequency: 4000 },
  ]);
  const r = rank(items, "bal");
  assert.equal(r[0].score, 1);
  assert.ok(r[0].score > r[1].score && r[1].score > r[2].score);
});
test("otimizador: escolhe os 5 melhores e prefere quem cobre a receita", () => {
  const items = team(
    Array.from({ length: 8 }, (_, i) => ({ frequency: 2000 + i * 400 })),
  );
  const best = bestTeam(rank(items, "bal"), {})
    .team.map((x) => x.sp.name)
    .sort();
  assert.deepEqual(best, ["S0", "S1", "S2", "S3", "S4"]);
  // S7 é lento, mas é o único que produz Milk: com Milk na receita ele deve entrar
  const milk = team([
    { frequency: 2000 },
    { frequency: 2400 },
    { frequency: 2800 },
    { frequency: 3200 },
    { frequency: 3600 },
    { frequency: 4000 },
    { frequency: 4400 },
    {
      frequency: 4800,
      ingredient0: [{ amount: 3, ingredient: ing("Milk", 98) }],
      ingredient30: [{ amount: 5, ingredient: ing("Milk", 98) }],
    },
  ]);
  const withMilk = bestTeam(rank(milk, "bal"), { Milk: 6 }).team.map(
    (x) => x.sp.name,
  );
  assert.ok(withMilk.includes("S7"));
  assert.equal(withMilk.length, 5);
  assert.ok(
    !bestTeam(rank(milk, "bal"), {}).team.some((x) => x.sp.name === "S7"),
  );
});
test("otimizador com menos de 5 Pokémon e análise do time", () => {
  const items = team([{ frequency: 2000 }, { frequency: 2200 }]);
  const b = bestTeam(rank(items, "berry"), {});
  assert.equal(b.team.length, 2);
  const a = analyze(rank(items, "berry"));
  assert.ok(
    Array.isArray(a.strong) &&
      Array.isArray(a.weak) &&
      typeof a.overall === "string",
  );
});
test("potencial de nível: subir para 30 e 60 aumenta o valor diário", () => {
  const value = (e) => e.berryStrength + e.ingStrength;
  const v = (L) => value(estimate(mon({ level: L }), D, SUBS));
  assert.ok(v(30) > v(29));
  assert.ok(v(60) > v(30));
  assert.equal(v(31), v(30)); // sem marco no meio: produção não muda
});
