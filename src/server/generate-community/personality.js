import BigFiveTrait from './big-five-trait'
import random from 'random'
import { pickRandom } from './shuffle'
import { between, isPopulatedArray } from '../../shared/utils'

export default class Personality {
  constructor () {
    this.openness = new BigFiveTrait()
    this.conscientiousness = new BigFiveTrait()
    this.extraversion = new BigFiveTrait()
    this.agreeableness = new BigFiveTrait()
    this.neuroticism = new BigFiveTrait()
  }

  /**
   * Adjust personality traits to express psychopathy.
   */

  expressPsychopathy () {
    this.openness.value += 1
    this.conscientiousness.value -= 2
    this.extraversion.value += 1
    this.agreeableness.value -= 2
    this.neuroticism.value += 2
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
   * Returns the average score for a trait in a population.
   * @param population {Person[]} - An array of Person objects.
   * @param trait {string} - The string to find the average value for. Valid
   *   values are `openness`, `conscientiousness`, `extraversion`,
   *   `agreeableness`, and `neuroticism`.
   * @returns {number} - The average value for that trait in the given
   *   population.
   */

  static getAverage (population, trait) {
    const scores = population.map(p => p.personality[trait].value)
    return scores.reduce((acc, curr) => acc + curr, 0) / scores.length
  }

  /**
   * Change a personality trait. If one is very agreeable (as reflected by two
   * separate agreeableness checks), she'll conform to the average of her
   * community. If she's somewhat agreeable (as reflected by a single
   * agreeableness check) and has partners, she'll conform to the average of
   * her partners. Otherwise, she'll change randomly.
   * @param community {Community} - (Optional) The community object.
   * @param partners {Person[]} - (Optional) An array of the person's partners.
   */

  change (community = undefined, partners = undefined) {
    const traits = [ 'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism' ]
    const directions = [ 1, -1 ]
    const willConformToCommunity = community && this.check('agreeableness') && this.check('agreeableness')
    const willConformToPartners = partners && isPopulatedArray(partners) && this.check('agreeableness')
    const trait = pickRandom(traits)
    let direction = pickRandom(directions)

    if (willConformToCommunity || willConformToPartners) {
      const avg = willConformToCommunity
        ? Personality.getAverage(community.people, trait)
        : Personality.getAverage(partners, trait)
      // Hey, doesn't this mean this person will frequently over-correct? Yeah, it does!
      // That's a feature, not a bug! People are messy and imprecise!
      direction = this[trait].value < avg ? 1 : -1
    }

    this[trait].change(direction)
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
