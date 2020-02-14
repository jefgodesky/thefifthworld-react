import random from 'random'

import {
  randomValFromNormalDistribution,
  probabilityInNormalDistribution
} from '../../shared/utils'

export default class Personality {
  constructor (vals) {
    this.traits = [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
    this.traits.forEach(trait => {
      this[trait] = vals && !isNaN(vals[trait]) ? vals[trait] : randomValFromNormalDistribution()
    })
  }

  /**
   * Returns a percent chance based on a particular trait. These traits are
   * all recorded on a normal distribution with a mean of 0 and a standard
   * distribution of 1, so someone with an openness of 0 would have a chance
   * of 50 based on openness.
   * @param trait {string} - The trait to derive the chance from. Accepted
   *   values are `openness`, `conscientiousness`, `extraversion`,
   *   `agreeableness`, and `neuroticism`.
   * @returns {number} - The percent chance based on the trait given. If not
   *   given an accepted trait string, returns -1 instead.
   */

  chance (trait) {
    if (this.traits.includes(trait)) {
      return probabilityInNormalDistribution(this[trait])
    } else {
      return -1
    }
  }

  /**
   * Checks if someone will do something based on a given trait.
   * @param trait {string} - The trait to derive the chance from. Accepted
   *   values are `openness`, `conscientiousness`, `extraversion`,
   *   `agreeableness`, and `neuroticism`.
   * @returns {boolean} - Returns `true` if the person will behave consistently
   *   with the given trait, or `false` if she will not.
   */

  check (trait) {
    return random.int(1, 100) < this.chance(trait)
  }
}
