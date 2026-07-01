export const Vth = 2.0

export function isChannelFormed(vgs: number): boolean {
  return vgs >= Vth
}
