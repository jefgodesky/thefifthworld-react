import random from 'random'

import { between, dedupe, isPopulatedArray, randomValFromNormalDistribution } from '../../shared/utils'

export default class Body {
  constructor () {
    this.longevity = Math.round(randomValFromNormalDistribution(80, 10))
    this.attractiveness = randomValFromNormalDistribution()
    this.type = randomValFromNormalDistribution()
    this.eyes = random.int(1, 1000) <= 4
      ? { left: 'blind', right: 'blind' }
      : { left: 'healthy', right: 'healthy' }
    this.ears = random.int(1, 1000) <= 1
      ? { left: 'deaf', right: 'deaf' }
      : { left: 'healthy', right: 'healthy' }
    this.arms = {
      left: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy',
      right: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy'
    }
    this.legs = {
      left: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy',
      right: random.int(1, 1000) <= 1 ? 'disabled' : 'healthy'
    }
    this.achondroplasia = random.int(1, 10000) === 1

    const both = random.int(1, 10000) < 85
    const neither = random.int(1, 10000) < 85

    if (both) {
      this.male = true
      this.female = true
    } else if (neither) {
      this.male = false
      this.female = false
    } else if (random.boolean()) {
      this.male = true
      this.female = false
    } else {
      this.male = false
      this.female = true
    }

    if (random.int(1, 10) === 1) this.makeInfertile()

    this.fertility = 0
    this.scars = []
  }

  /**
   * Marks this body as infertile (that is, incapable of reproducing sexually).
   */

  makeInfertile () {
    this.fertility = 0
    this.infertile = true
  }

  /**
   * Adjust fertility for a given age.
   * @param hasProblems {boolean} - `true` if the community is experiencing
   *   some problems. This causes stress, which reduces fertility.
   * @param age {number} - The person's age in years.
   */

  adjustFertility (hasProblems, age) {
    if (!this.infertile) {
      const { male, female, fertility } = this
      const mod = hasProblems ? -5 : 20
      const max = age <= 20
        ? Math.max(100 + (-1) * Math.pow(60 + (-3 * age), 2), 0)
        : age > 20 && female
          ? Math.max(100 + (-1) * Math.pow(6.5 + (-0.325 * age), 2), 0)
          : age > 20 && male
            ? Math.max(100 + (-1) * Math.pow(4 + (-0.2 * age), 2), 0)
            : 0
      this.fertility = between(fertility + mod, 0, max)
    }
  }

  /**
   * Reports if an eye, ear, arm, or leg is blind, deaf, missing, or disabled.
   * @param part {string} - The part to look for. This should consist of either
   *   `'left'` or `'right'`, followed by `'eye'`, '`ear`', '`arm`', or '`leg`'
   *   (e.g., `'left arm'`).
   * @returns {boolean} - `true` if that part is blind, deaf, missing, or
   *   disabled, or `false` if it is not.
   */

  isGone (part) {
    const sides = [ 'left', 'right' ]
    const keys = [ 'eye', 'ear', 'arm', 'leg' ]
    const gone = [ 'disabled', 'missing', 'blind', 'deaf' ]
    const parts = part.split(' ')
    return isPopulatedArray(parts) && parts.length > 1 && sides.includes(parts[0]) && keys.includes(parts[1])
      ? gone.includes(this[`${parts[1]}s`][parts[0]])
      : false
  }

  /**
   * Adds a scar.
   * @param location {string} - Where the scar is located.
   */

  takeScar (location) {
    this.scars.push(location)
  }

  /**
   * Returns an object reporting a body's scars.
   * @returns {Object} - An object with each location as a property, the value
   *   of which is the total number of scars found there.
   */

  reportScars () {
    const locations = dedupe(this.scars)
    const report = {}
    locations.forEach(loc => {
      const num = this.scars.filter(l => l === loc).length
      report[loc] = num
    })
    return report
  }
}
