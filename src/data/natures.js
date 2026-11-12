// A SleepAPI só lista os NOMES das naturezas (/api/nature); os efeitos vêm desta tabela MANUAL.
// Fonte: quais atributos sobem/descem, conferido em Bulbapedia, Serebii e Game8.
// sp=velocidade de ajuda, in=busca de ingredientes, sk=chance de habilidade (en=energia, xp=EXP: só informativos)
const t = 'Lonely:sp,en|Adamant:sp,in|Naughty:sp,sk|Brave:sp,xp|Bold:en,sp|Impish:en,in|Lax:en,sk|Relaxed:en,xp|Modest:in,sp|Mild:in,en|Rash:in,sk|Quiet:in,xp|Calm:sk,sp|Gentle:sk,en|Careful:sk,in|Sassy:sk,xp|Timid:xp,sp|Hasty:xp,en|Jolly:xp,in|Naive:xp,sk'
export const NATURES = Object.fromEntries(t.split('|').map(s => { const [n, e] = s.split(':'); const [up, down] = e.split(','); return [n, { up, down }] }))
// Neutras (sem efeito): Bashful, Hardy, Docile, Quirky, Serious.
