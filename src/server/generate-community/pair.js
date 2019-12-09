import random from 'random'

export default class Pair {
  constructor (a, b) {
    const aIsPerson = a && a.constructor && a.constructor.name === 'Person'
    const bIsPerson = b && b.constructor && b.constructor.name === 'Person'
    if (aIsPerson && bIsPerson) {
      const dist = a.personality.distance(b.personality)
      const theHeartWants = random.int(-5, 5)
      this.love = (dist + theHeartWants) * -1 // Negative scores being better seems counter-intuitive...
      a.pairs = a.pairs && Array.isArray(a.pairs)
        ? [ ...a.pairs, this ]
        : [ this ]
      b.pairs = b.pairs && Array.isArray(b.pairs)
        ? [ ...b.pairs, this ]
        : [ this ]
    } else {
      return false
    }
  }
}
