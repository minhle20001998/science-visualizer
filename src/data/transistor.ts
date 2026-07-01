export const NMOS_DIM = {
  subW: 7,
  subH: 3,
  subD: 4.5,
  srcW: 1.6,
  srcH: 1.4,
  srcD: 3.6,
  drnW: 1.6,
  drnH: 1.4,
  drnD: 3.6,
  chW: 1.8,
  chH: 0.25,
  chD: 3.6,
  oxW: 2.4,
  oxH: 0.1,
  oxD: 4,
  gateW: 2.8,
  gateH: 0.45,
  gateD: 4.3,
}

export const NMOS_COLORS = {
  substrate: '#a8a8b8',
  substrateEdge: '#2a2a4a',
  sourceDrain: '#4af0ff',
  sourceDrainGlow: '#4af0ff',
  sourceDrainEmissive: '#4af0ff',
  oxide: '#c878ff',
  oxideOpacity: 0.2,
  gate: '#c0c0c0',
  gateEdge: '#888888',
  channelOn: '#00ffee',
  channelOff: '#0a2a2a',
  electron: '#00ffcc',
  depletion: '#ff6666',
  depletionOpacity: 0.12,
}

export function srcPos(): [number, number, number] {
  return [-(NMOS_DIM.subW / 2 - NMOS_DIM.srcW / 2 - 0.2), 0, 0]
}
export function drnPos(): [number, number, number] {
  return [(NMOS_DIM.subW / 2 - NMOS_DIM.drnW / 2 - 0.2), 0, 0]
}
export function chPos(): [number, number, number] {
  return [0, NMOS_DIM.srcH / 2 - NMOS_DIM.chH / 2, 0]
}
export function oxPos(): [number, number, number] {
  return [0, NMOS_DIM.srcH / 2 + NMOS_DIM.chH / 2 + NMOS_DIM.oxH / 2, 0]
}
export function gatePos(): [number, number, number] {
  return [0, NMOS_DIM.srcH / 2 + NMOS_DIM.chH / 2 + NMOS_DIM.oxH + NMOS_DIM.gateH / 2, 0]
}
