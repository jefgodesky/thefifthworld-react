import random from 'random'

import Body from './body'
import Personality from './personality'

export default class Genotype {
  constructor (body, personality) {
    const givenBody = (body && body.constructor && body.constructor.name === 'Body')
    const givenPersonality = (personality && personality.constructor && personality.constructor.name === 'Personality')
    this.body = givenBody ? Body.copy(body) : new Body()
    this.personality = givenPersonality ? Personality.copy(personality) : new Personality()
  }

  /**
   * Modifies a value that is normally distributed.
   * @param orig {number} - The original value to be modified.
   * @param std {number} - Optional. The standard deviation of the normal
   *   distribution (Default: `1`).
   */

  modifyNormal (orig, std = 1) {
    return orig + random.float(-0.1, 0.1) * std
  }

  /**
   * Introduces modification (as in, "descent with modification," i.e.,
   * random mutations and variations).
   */

  modify () {
    this.body.longevity = this.modifyNormal(this.body.longevity, 10)
    this.body.attractiveness = this.modifyNormal(this.body.attractiveness)
    this.body.type = this.modifyNormal(this.body.type)
    this.personality.openness = this.modifyNormal(this.personality.openness)
    this.personality.conscientiousness = this.modifyNormal(this.personality.conscientiousness)
    this.personality.extraversion = this.modifyNormal(this.personality.extraversion)
    this.personality.agreeableness = this.modifyNormal(this.personality.agreeableness)
    this.personality.neuroticism = this.modifyNormal(this.personality.neuroticism)
  }
}
