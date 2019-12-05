import random from 'random'

import Body from './body'
import Personality from './personality'
import Sexuality from './sexuality'

export default class Person {
  constructor (args = {}) {
    if (args && args.mother && args.mother.genotype && args.father && args.father.genotype) {
      this.genotype = Body.makeBaby([ args.mother.genotype, args.father.genotype ], args.born) || new Body()
    } else {
      this.genotype = new Body(args)
    }

    this.body = new Body({ copy: this.genotype })
    this.personality = new Personality()
    this.sexuality = new Sexuality(this.body, args.mateFor)
    this.gender = args && args.specifiedGender ? args.specifiedGender : this.assignGender(args.numGenders)

    const randomDistributed = random.normal(0, 1)
    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    this.psychopath = null
    if (random.int(1, 100) === 1) this.makePsychopath()

    this.history = []
  }

  /**
   * Assign gender.
   * @param genders {number} - The number
   * @returns {string} - An appropriate gender to assign to this person.
   */

  assignGender (genders = 3) {
    const roll = random.int(1, 100)
    const { hasPenis, hasWomb } = this.body
    const both = hasPenis && hasWomb
    const neither = !hasPenis && !hasWomb
    const intersex = both || neither
    let gender = this.body.hasPenis ? 'Man' : 'Woman'
    if (genders === 3) {
      if (roll > 90 || (intersex && roll > 10)) gender = 'Third gender'
    } else if (genders > 3) {
      if (genders > 4 && (roll > 95 || (intersex && roll > 10))) gender = 'Fifth gender'
      if ((gender === 'Woman' && intersex) || (gender === 'Woman' && roll > 90)) gender = 'Masculine woman'
      if ((gender === 'Man' && intersex) || (gender === 'Man' && roll > 90)) gender = 'Feminine man'
      if (gender === 'Woman') gender = 'Feminine woman'
      if (gender === 'Man') gender = 'Masculine man'
    }
    return gender
  }

  /**
   * This person is a psychopath. Mark as such and make necessary adjustments
   * to personality scores.
   */

  makePsychopath () {
    if (this.psychopath === null) {
      this.psychopath = 1
      this.personality.openness.value += 1
      this.personality.conscientiousness.value -= 2
      this.personality.extraversion.value += 1
      this.personality.agreeableness.value -= 2
      this.personality.neuroticism.value += 2
    }
  }
}
