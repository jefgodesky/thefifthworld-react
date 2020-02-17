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

    const base = random.int(0, 100)
    this.androphilia = Math.round(base * (shares.andro / shares.total))
    this.gynephilia = Math.round(base * (shares.gyne / shares.total))
    this.skoliophilia = Math.round(base * (shares.skolio / shares.total))
  }
}
