import random from 'random'

import Body from './body'
import Personality from './personality'

export default class Genotype {
  constructor (body, personality) {
    const givenBody = (body && body.constructor && body.constructor.name === 'Body')
    const givenPersonality = (personality && personality.constructor && personality.constructor.name === 'Personality')
    this.body = givenBody ? Body.copy(body) : new Body()
    this.personality = givenPersonality ? Personality.copy(personality) : new Personality()
    this.viable = true
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

  /**
   * Handles the inheritance of achondroplasia. This maps pretty cleanly to a
   * classic Punnett square. If you inherit achondroplasia from both parents,
   * though, you won't survive.
   * @param a {Genotype} - The `Genotype` object of one parent.
   * @param b {Genotype} - The `Genotype` object of one parent.
   */

  inheritAchondroplasia (a, b) {
    const fromA = a.body.achondroplasia && random.boolean()
    const fromB = b.body.achondroplasia && random.boolean()
    if (fromA && fromB) {
      this.body.achondroplasia = true
      this.viable = false
    } else if (fromA || fromB) {
      this.body.achondroplasia = true
    }
  }

  /**
   * Tests whether or not both parents are passing on a problem with a
   * particular part of the body.
   * @param set {string} - Valid options are `arms`, `legs`, `eyes`, or `ears`.
   * @param a {Genotype} - The `Genotype` object for one parent.
   * @param b {Genotype} - The `Genotype` object for the other parent.
   * @returns {boolean} - `true` if both parents are passing on a problem with
   *   the specified part of the body, or `false` if not.
   */

  static both (set, a, b) {
    const aHealthy = a.body[set].left === 'healthy' && a.body[set].right === 'healthy'
    const bHealthy = b.body[set].left === 'healthy' && b.body[set].right === 'healthy'
    return !aHealthy && !bHealthy
  }

  /**
   * Tests whether or not either parent is passing on a problem with a
   * particular part of the body.
   * @param set {string} - Valid options are `arms`, `legs`, `eyes`, or `ears`.
   * @param a {Genotype} - The `Genotype` object for one parent.
   * @param b {Genotype} - The `Genotype` object for the other parent.
   * @returns {boolean} - `true` if either parents is passing on a problem with
   *   the specified part of the body, or `false` if not.
   */

  static either (set, a, b) {
    const aNotHealthy = a.body[set].left !== 'healthy' || a.body[set].right !== 'healthy'
    const bNotHealthy = b.body[set].left !== 'healthy' || b.body[set].right !== 'healthy'
    return aNotHealthy || bNotHealthy
  }

  /**
   * Tests whether a child should inherit a problem with sight, hearing, or
   * disabled arms or legs.
   * @param set {string} - Valid options are `arms`, `legs`, `eyes`, or `ears`.
   * @param a {Genotype} - The `Genotype` object for one parent.
   * @param b {Genotype} - The `Genotype` object for the other parent.
   * @returns {boolean} - `true` if the child is inheriting a problem, or
   *   `false` if she isn't.
   */

  static inheritDisability (set, a, b) {
    const roll = random.int(1, 4)
    return (Genotype.both(set, a, b) && roll < 4) || (Genotype.either(set, a, b) && roll === 1)
  }
}
