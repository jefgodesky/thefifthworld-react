import random from 'random'

import {
  anyTrue,
  allTrue,
  randomValFromNormalDistribution,
  probabilityInNormalDistribution
} from '../../shared/utils'

export default class Personality {
  constructor (vals) {
    const traits = Personality.getTraitList()
    traits.forEach(trait => {
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
    const traits = Personality.getTraitList()
    if (traits.includes(trait)) {
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
   * @param times {number} - Optional. How many times should we check?
   *   (Default: `1`)
   * @param logic {string} - Optional. If we check multiple times, are we
   *   looking for all the checks to pass (`and`) or any of them (`or`)?
   *   Accepted values are `and` or `or` (Default: `and`).
   * @returns {boolean} - Returns `true` if the person will behave consistently
   *   with the given trait, or `false` if she will not.
   */

  check (trait, times = 1, logic = 'and') {
    const checks = []
    for (let i = 0; i < times; i++) {
      checks.push(random.int(1, 100) < this.chance(trait))
    }
    return logic === 'or' ? anyTrue(checks) : allTrue(checks)
  }

  /**
   * Return a list of the Big Five personality traits.
   * @returns {string[]} - An array of strings identifying the Big Five
   *   personality traits.
   */

  static getTraitList () {
    return [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
  }
}
