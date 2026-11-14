// Uso: node scripts/baixar-imagens.mjs   (precisa de internet; roda uma vez, depois faça commit de public/img)
// Fonte: ícones do Neroli's Lab (https://nerolislab.com/guides/contributing/custom-emojis.html).
// Os ícones do jogo pertencem à The Pokémon Company; uso pessoal.
import { mkdir, writeFile } from "node:fs/promises";
const BASE = "https://nerolislab.com/guides/assets/";
const FILES = {
  ing: {
    apple: "B8awZT2r",
    avocado: "CopDEc9Y",
    cacao: "GqUGcK10",
    coffee: "CA45vf8P",
    corn: "D65O8gs5",
    ginger: "CFR0L4u3",
    herb: "BSHYJF70",
    honey: "CsJungh2",
    leek: "AhH8Pp92",
    milk: "DemXUsly",
    mushroom: "DOYSu7DT",
    oil: "CKcBLuNa",
    potato: "C2k6b7WU",
    pumpkin: "Dn5nFOlP",
    sausage: "xDaVHhHf",
    soybean: "Vuy72f73",
    tail: "ChrDJvJ3",
    tomato: "DZrEcmJ_",
  },
  berry: {
    belue: "CdDaSbb0",
    bluk: "ib9QGWKZ",
    cheri: "95oCKr2q",
    chesto: "67RNRWyx",
    durin: "Cfnqq-Fp",
    figy: "DG-XDRgA",
    grepa: "DwWpqtJ9",
    leppa: "BMuXNHJU",
    lum: "7xup-IjY",
    mago: "Df4rOaPN",
    oran: "C8Y7Jlnv",
    pamtre: "CIBP1o8g",
    pecha: "Cixgy-ow",
    persim: "CMZ3NLA2",
    rawst: "hAO63Mzt",
    sitrus: "CsIAl1VD",
    wiki: "CbMI1r_u",
    yache: "BEigLa9P",
  },
  island: {
    amber: "DEY-ANQo",
    cyan: "A5rx5GOV",
    greengrass: "ClSPxjK-",
    lapis: "BY10qdd0",
    powerplant: "B3lLYOOs",
    snowdrop: "x-pSbuIi",
    taupe: "DZ_TO2hl",
  },
};
const HEADERS = {
  "User-Agent":
    "SleepDex-personal-tool/1.0 (one-time icon download for a personal project)",
  Accept: "image/png,image/*;q=0.8",
};
let ok = 0,
  total = 0;
for (const [kind, items] of Object.entries(FILES)) {
  await mkdir(`public/img/${kind}`, { recursive: true });
  for (const [key, hash] of Object.entries(items)) {
    total++;
    try {
      const r = await fetch(`${BASE}${key}.${hash}.png`, { headers: HEADERS });
      if (!r.ok) throw new Error("HTTP " + r.status);
      await writeFile(
        `public/img/${kind}/${key}.png`,
        Buffer.from(await r.arrayBuffer()),
      );
      ok++;
    } catch (e) {
      console.log("FALHOU", kind, key, e.message);
    }
  }
}
console.log(
  `${ok}/${total} imagens baixadas em public/img` +
    (ok < total ? " (as que falharam continuam como emoji)" : ""),
);
