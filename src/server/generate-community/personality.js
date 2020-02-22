import random from 'random'

import {
  anyTrue,
  allTrue,
  clone,
  intersection,
  randomValFromNormalDistribution,
  probabilityInNormalDistribution
} from '../../shared/utils'
import { shuffle, pickRandom } from './utils'

export default class Personality {
  constructor (vals) {
    const traits = Personality.getTraitList()
    traits.forEach(trait => {
      this[trait] = vals && !isNaN(vals[trait]) ? vals[trait] : randomValFromNormalDistribution()
    })
    this.diagnose()
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
   * Personality is supposed to be mostly stable over time, but it changes more
   * than most of us give it credit for.
   */

  change () {
    // TODO: Factor in how community influences how your personality changes
    // TODO: Factor in how your partners influence how your personality changes
    const trait = pickRandom(Personality.getTraitList())
    this[trait] += random.boolean() ? 0.1 : -0.1
    this.diagnose()
  }

  /**
   * Adds a personality disorder.
   * @param disorder {string} - The disorder to add.
   */

  addDisorder (disorder) {
    if (!this.disorders) this.disorders = []
    if (!this.disorders.includes(disorder)) this.disorders.push(disorder)
  }

  /**
   * Removes a personality disorder.
   * @param disorder {string} - THe disorder to remove.
   */

  removeDisorder (disorder) {
    if (this.disorders && this.disorders.includes(disorder)) {
      this.disorders = this.disorders.filter(d => d !== disorder)
    }
  }

  /**
   * Check if this person has any personality disorders rooted in excessive
   * openness to new experiences.
   */

  diagnoseExcessiveOpenness () {
    if (this.openness > 2) {
      this.addDisorder('schizophrenia')
    } else {
      this.removeDisorder('schizophrenia')
    }
  }

  /**
   * Check if this person has any personality disorders rooted in deficient
   * conscientiousness.
   */

  diagnoseExcessiveConscientiousness () {
    if (this.conscientiousness > 2) {
      this.addDisorder('obsessive-compulsive')
    } else {
      this.removeDisorder('obsessive-compulsive')
    }
  }

  /**
   * Check if this person has any personality disorders rooted in deficient
   * conscientiousness.
   */

  diagnoseDeficientConscientiousness () {
    if (this.conscientiousness < -2) {
      this.addDisorder('impulse control')
    } else {
      this.removeDisorder('impulse control')
    }
  }

  /**
   * Check if this person has any personality disorders rooted in deficient
   * extraversion.
   */

  diagnoseDeficientExtraversion () {
    if (this.extraversion < -2) {
      this.addDisorder('schizoid')
    } else {
      this.removeDisorder('schizoid')
    }
  }

  /**
   * Check if this person has any personality disorders rooted in deficient
   * agreeableness.
   */

  diagnoseDeficientAgreeableness () {
    if (this.agreeableness < -2) {
      this.addDisorder('antisocial')
    } else {
      this.removeDisorder('antisocial')
    }
  }

  /**
   * Check if this person has any personality disorders rooted in excessive
   * neuroticism.
   */

  diagnoseExcessiveNeuroticism () {
    const disorders = [ 'depression', 'anxiety', 'bipolar', 'borderline', 'histrionic' ]
    const num = Math.min(Math.max(Math.round((this.neuroticism - 2) * 4), 0), disorders.length)
    const myDisorders = this.disorders ? intersection(disorders, this.disorders) : []
    const delta = num - myDisorders.length

    if (delta > 0) {
      if (!this.disorders) this.disorders = []
      const available = shuffle(disorders.filter(d => !this.disorders.includes(d)))
      for (let i = 0; i < delta; i++) {
        this.addDisorder(available[i])
      }
    } else if (delta < 0) {
      const available = shuffle(myDisorders)
      for (let i = 0; i < Math.abs(delta); i++) {
        this.removeDisorder(available[i])
      }
    }
  }

  /**
   * Diagnoses autism based on a very low score in the first four of the Big
   * Five personality traits, plus a correspondingly high score on neuroticism.
   */

  diagnoseAutism () {
    const lowOpenness = this.openness <= -0.14
    const lowConscientiousness = this.conscientiousness <= -0.14
    const lowExtraversion = this.extraversion <= -0.14
    const lowAgreeableness = this.agreeableness <= -0.14
    const highNeuroticism = this.neuroticism > 0.14

    if (lowOpenness && lowConscientiousness && lowExtraversion && lowAgreeableness && highNeuroticism) {
      this.addDisorder('autism')
    } else {
      this.removeDisorder('autism')
    }
  }

  /**
   * Diagnose personality disorders based on exceptionally high and
   * exceptionally low scores in your Big Five personality traits.
   */

  diagnose () {
    if (!this.disorders) this.disorders = []
    this.diagnoseExcessiveOpenness()
    this.diagnoseExcessiveConscientiousness()
    this.diagnoseDeficientConscientiousness()
    this.diagnoseDeficientExtraversion()
    this.diagnoseDeficientAgreeableness()
    this.diagnoseExcessiveNeuroticism()
    this.diagnoseAutism()
  }

  /**
   * Return a list of the Big Five personality traits.
   * @returns {string[]} - An array of strings identifying the Big Five
   *   personality traits.
   */

  static getTraitList () {
    return [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
  }

  /**
   * Copy a Personality object into a new Personality object.
   * @param src {Personality} - The Personality object to copy.
   * @returns {Personality} - A copy of the Personality object given.
   */

  static copy (src) {
    const traits = Personality.getTraitList()
    const obj = {}
    traits.forEach(trait => { obj[trait] = src[trait] })
    return new Personality(obj)
  }
}
