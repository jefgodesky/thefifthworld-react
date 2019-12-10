import random from 'random'

export default class Pair {
  constructor (a, b, save = true) {
    const aIsPerson = a && a.constructor && a.constructor.name === 'Person'
    const bIsPerson = b && b.constructor && b.constructor.name === 'Person'
    if (aIsPerson && bIsPerson) {
      const dist = a.personality.distance(b.personality)
      const desire = random.int(-5, 5)
      this.love = (dist + desire) * -1 // Negative scores being better seems counter-intuitive...
      this.a = a
      this.b = b
      if (save) this.save()
    } else {
      return false
    }
  }

  /**
   * Add the pair to each of the person objects involved.
   * @param a {Person} - One person in the pair.
   * @param b {Person} - One person in the pair.
   */

  save () {
    if (this.a && this.b) {
      this.a.pairs = this.a.pairs && Array.isArray(this.a.pairs)
        ? [...this.a.pairs, this]
        : [this]
      this.b.pairs = this.b.pairs && Array.isArray(this.b.pairs)
        ? [...this.b.pairs, this]
        : [this]
    }
  }
}
