import BigFiveTrait from './big-five-trait'
import { pickRandom } from './shuffle'

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
}
