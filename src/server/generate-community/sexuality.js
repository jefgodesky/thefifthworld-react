import random from 'random'

import Body from './body'
import Personality from './personality'

export default class Sexuality {
  constructor (body = new Body(), personality = new Personality()) {
    const homosexual = random.int(1, 100) > 85
    const shares = { andro: 0, gyne: 0, skolio: 0 }
    const { male, female } = body

    if ((!homosexual && female) || (homosexual && male)) {
      shares.andro += random.int(7, 10)
      shares.gyne += random.int(0, 3)
    }

    if ((!homosexual && male) || (homosexual && female)) {
      shares.gyne += random.int(7, 10)
      shares.andro += random.int(0, 3)
    }

    shares.skolio += Math.round(personality.chance('openness') / 10)
    shares.total = shares.andro + shares.gyne + shares.skolio

    const isAce = random.int(1, 100) === 1
    const rolls = []
    for (let i = 0; i < 4; i++) rolls.push(random.int(1, 100))
    const base = isAce ? 0 : Math.max(...rolls)

    this.androphilia = Math.round(base * (shares.andro / shares.total))
    this.gynephilia = Math.round(base * (shares.gyne / shares.total))
    this.skoliophilia = Math.round(base * (shares.skolio / shares.total))
  }

  /**
   * Tests whether this person is attracted to someone.
   * @param person {Person} - The other that you may or may not be
   *   attracted to.
   * @returns {boolean} - `true` if you're attracted to this person, or `false`
   *   if you are not.
   */

  isAttractedTo (person) {
    const androphilic = [ 'Masculine man', 'Man', 'Feminine man' ]
    const gynephilic = [ 'Feminine woman', 'Woman', 'Masculine woman' ]
    const skoliophilic = [ 'Fifth gender', 'Third gender', 'Feminine man', 'Masculine woman' ]

    let chance = 0
    if (androphilic.includes(person.gender)) chance += this.androphilia
    if (gynephilic.includes(person.gender)) chance += this.gynephilia
    if (skoliophilic.includes(person.gender)) chance += this.skoliophilia

    return random.int(1, 100) < chance
  }
}
