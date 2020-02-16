import random from 'random'

import { between, dedupe, isPopulatedArray, randomValFromNormalDistribution } from '../../shared/utils'
import { checkTable } from './utils'

import tables from '../../data/community-creation'

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

  /**
   * Makes the person deaf in one ear.
   * @param injury {boolean} - Optional. If `true`, you're losing your ear, not
   *   just your hearing in it, so it's lost rather than deafened (that is, the
   *   string is set to `'missing'` rather than `'deaf'`) (Default: `false`).
   * @returns {boolean} - `true` if the person is made deaf in one ear, or
   *   `false` if it failed (because she was already deaf in both ears).
   */

  deafen (injury = false) {
    const before = `${this.ears.left} ${this.ears.right}`
    const side = random.boolean() ? 'left' : 'right'
    const other = side === 'left' ? 'right' : 'left'

    if (this.ears[side] === 'deaf') {
      this.ears[other] = injury ? 'missing' : 'deaf'
    } else {
      this.ears[side] = injury ? 'missing' : 'deaf'
    }

    return `${this.ears.left} ${this.ears.right}` !== before
  }

  /**
   * Makes the person blind in one eye.
   * @param injury {boolean} - Optional. If `true`, you're losing your eye, not
   *   just your sight in it, so it's lost rather than blinded (that is, the
   *   string is set to `'missing'` rather than `'blind'`) (Default: `false`).
   * @returns {string} - `'left'` if the left eye was blinded or lost,
   *   `'right'` if the right eyes was blinded or lost, or `'none'` if neither
   *   eye was blinded or lost (for example, if both eyes were already blinded
   *   or lost to begin with).
   */

  blind (injury = false) {
    const check = `${this.eyes.left} ${this.eyes.right}`
    const blind = [ 'blind', 'missing' ]
    const chosen = random.boolean() ? 'right' : 'left'
    const other = chosen === 'right' ? 'left' : 'right'
    const side = blind.includes(this.eyes[chosen]) ? other : chosen
    this.eyes[side] = injury ? 'missing' : 'blind'
    return check === `${this.eyes.left} ${this.eyes.right}` ? 'none' : side
  }

  /**
   * Handles a bout of sickness.
   * @returns {{prognosis: string, tags: [string]}} = An object with two
   *   properties: `prognosis` (a string describing the outcome of the
   *   sickness) and `tags` (an array with a single string, `'sickness'`).
   *   This object is suitable for adding to a `History` object with
   *   `History.add`.
   */

  getSick () {
    const event = {
      tags: [ 'sickness' ],
      prognosis: checkTable(tables.illness)
    }

    switch (event.prognosis) {
      case 'deaf':
        if (!this.deafen()) event.prognosis = 'recovery'
        break
      case 'blind':
        if (!this.blind()) event.prognosis = 'recovery'
        break
      default: break
    }

    return event
  }
}
