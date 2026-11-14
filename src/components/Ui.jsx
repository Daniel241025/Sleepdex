import { useState } from 'react'
import { sprite } from '../services/sleepApi.js'
import { ingChoice } from '../utils/calc.js'
export const SPEC = { berry: 'Berries', ingredient: 'Ingredientes', skill: 'Habilidades', all: 'Todas' }
const BASE = import.meta.env.BASE_URL
const EMO = { apple: '🍎', milk: '🥛', honey: '🍯', ginger: '🫚', egg: '🥚', leek: '🧅', mushroom: '🍄', oil: '🫒', potato: '🥔', tomato: '🍅', sausage: '🌭', soybean: '🫘', corn: '🌽', coffee: '☕', herb: '🌿', tail: '🦎', cacao: '🍫', pumpkin: '🎃', avocado: '🥑' }
// Ícone em public/img/{ing|berry|island}/{nome}.png; se o arquivo não existir, mostra um emoji.
export function Img({ kind, name, size = 28 }) {
  const [bad, setBad] = useState(false), k = String(name || '').toLowerCase()
  if (bad || !k) return <span className="fb" style={{ width: size, height: size, fontSize: size * 0.62 }}>{kind === 'ing' ? EMO[k] || '🥣' : kind === 'berry' ? '🫐' : '🏝️'}</span>
  return <img className="ico" src={`${BASE}img/${kind}/${k}.png`} width={size} height={size} alt={name} title={name} onError={() => setBad(true)} />
}
export const Sprite = ({ sp }) => sp ? <img className="sprite" src={sprite(sp.pokedexNumber)} alt="" onError={e => (e.target.style.visibility = 'hidden')} /> : <div className="sprite" />
export function MonLine({ mon, sp, children }) {
  return <div className="monline"><Sprite sp={sp} /><div><b>{mon.name}</b><div className="muted">{sp?.displayName ?? mon.species} · Nv {mon.level} · {mon.nature}{sp ? ` · ${SPEC[sp.specialty] || sp.specialty}` : ''}</div></div><div className="grow" />{children}</div>
}
export function MonCard({ m, on, disabled, onClick }) {
  const { mon, sp } = m
  const slots = [0, 30, 60].filter(k => k === 0 || mon.level >= k).map(k => ingChoice(sp, mon, k)).filter(Boolean)
  return <button type="button" className={'mcard' + (on ? ' on' : '')} disabled={disabled} onClick={onClick}>
    <Sprite sp={sp} /><b>{mon.name}</b><span className="muted">Nv {mon.level} · {SPEC[sp.specialty] || sp.specialty}</span>
    <span className="icons"><Img kind="berry" name={sp.berry.name} size={22} />{slots.map((s, i) => <Img key={i} kind="ing" name={s.ingredient.name} size={22} />)}</span>
  </button>
}
