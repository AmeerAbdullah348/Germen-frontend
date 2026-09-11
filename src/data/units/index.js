import unit1 from './unit1.json'
import unit2 from './unit2.json'
import unit3 from './unit3.json'
import unit4 from './unit4.json'
import unit5 from './unit5.json'
import unit6 from './unit6.json'
import unit7 from './unit7.json'
import unit8 from './unit8.json'
import unit9 from './unit9.json'
import unit10 from './unit10.json'
import unit11 from './unit11.json'
import unit12 from './unit12.json'

export const UNITS = [
  unit1,
  unit2,
  unit3,
  unit4,
  unit5,
  unit6,
  unit7,
  unit8,
  unit9,
  unit10,
  unit11,
  unit12,
].sort((a, b) => a.order - b.order)

export const UNITS_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]))
