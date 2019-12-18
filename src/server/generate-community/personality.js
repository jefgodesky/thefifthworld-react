import BigFiveTrait from './big-five-trait'
import random from 'random'
import { pickRandom } from './shuffle'
import { between } from '../../shared/utils'

export default class Personality {
  constructor () {
    this.openness = new BigFiveTrait()
    this.conscientiousness = new BigFiveTrait()
    this.extraversion = new BigFiveTrait()
    this.agreeableness = new BigFiveTrait()
    this.neuroticism = new BigFiveTrait()
  }

  /**
   * Returns the sum of the distances between each of the Big Five personality
   * traits.
   * @param other {Personality} - The personality to compare to.
   * @returns {number} - The sum of the distances between each of the Big Five
   *   personality traits between this personality and the given `other`
   *   personality.
   */

  distance (other) {
    const o = this.openness.distance(other.openness)
    const c = this.conscientiousness.distance(other.conscientiousness)
    const e = this.extraversion.distance(other.extraversion)
    const a = this.agreeableness.distance(other.agreeableness)
    const n = this.neuroticism.distance(other.neuroticism)
    return o + c + e + a + n
  }

  /**
   * Change a personality trait.
   * @param how {string} - (Optional) Which personality trait and how to change
   *   it. The first character should either be `+` (indicating that the trait
   *   should be increased) or `-` (indicating that it should be decreased),
   *   followed by the trait to adjust (one of the Big Five personality
   *   traits). Thus, the valid values are `+openness`, `-openness`,
   *   `+conscientiousness`, `-conscientiousness`, `+extraversion`,
   *   `-extraversion`, `+agreeableness`, `-agreeableness`, `+neuroticism`,
   *   or `-neuroticism`. If not given, a random value is chosen.
   *   (Default: `null`)
   */

  change (how = null) {
    if (!how) {
      // No direction specified, so we'll pick one at random
      const dir = pickRandom([ '+', '-' ])
      const trait = pickRandom([ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ])
      how = `${dir}${trait}`
    }

    // What change are we making?
    const dir = how.substr(0, 1) === '+' ? 1 : -1
    const trait = how.substr(1)

    // Make that change.
    this[trait].change(dir)
  }

  /**
   * Uses a personality trait to create a probability.
   * @param basedOn {string} - The personality trait to use. Valid values are
   *   `openness`, `conscientiousness`, `extraversion`, `agreeableness`, and
   *   `neuroticism`.
   * @returns {number} - The probability that the person will act in accordance
   *   with that trait (i.e., given `openness`, the probability that she'll
   *   behave in an open way; given `conscientiousness`, the probability that
   *   she'll do the conscientious thing, etc.)
   */

  chance (basedOn) {
    return between((this[basedOn].value + 3) * 16, 1, 99)
  }

  /**
   * Calculates a probability using the `chance` method and checks it against
   * a random integer to turn that probability into a probabilistic boolean.
   * @param basedOn {string} - The personality trait to use. Valid values are
   *   `openness`, `conscientiousness`, `extraversion`, `agreeableness`, and
   *   `neuroticism`.
   * @returns {boolean} - `true` if the person will act in this way, or `false`
   *   if she won't this time.
   */

  check (basedOn) {
    const probability = this.chance(basedOn)
    return random.int(1, 100) < probability
  }
}
