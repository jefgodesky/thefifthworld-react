import random from 'random'

import Body from './body'
import Personality from './personality'
import Polycule from './polycule'
import Sexuality from './sexuality'
import Skills from './skills'
import { between } from '../../shared/utils'

export default class Person {
  constructor (args = {}) {
    const now = new Date()
    const year = args.born || now.getFullYear()
    if (args && args.mother && args.mother.genotype && args.father && args.father.genotype) {
      this.genotype = Body.makeBaby([ args.mother.genotype, args.father.genotype ], args) || new Body()
    } else {
      this.genotype = new Body(args)
    }

    this.body = new Body({ copy: this.genotype })
    this.personality = new Personality()
    this.skills = new Skills()
    this.sexuality = new Sexuality(this.body, args.mateFor)
    this.gender = args && args.specifiedGender ? args.specifiedGender : this.assignGender(args.numGenders)

    const randomDistributed = random.normal(0, 1)
    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    if (this.body.psychopath) this.personality.expressPsychopathy()

    this.born = year
    this.present = year

    if (this.genotype.dead) this.die('infant mortality', year)
  }

  /**
   * Assign gender.
   * @param genders {number} - The number
   * @returns {string} - An appropriate gender to assign to this person.
   */

  assignGender (genders = 3) {
    const roll = random.int(1, 100)
    const { hasPenis, hasWomb } = this.body
    const both = hasPenis && hasWomb
    const neither = !hasPenis && !hasWomb
    const intersex = both || neither
    let gender = this.body.hasPenis ? 'Man' : 'Woman'
    if (genders === 3) {
      if (roll > 90 || (intersex && roll > 10)) gender = 'Third gender'
    } else if (genders > 3) {
      if (genders > 4 && (roll > 95 || (intersex && roll > 10))) gender = 'Fifth gender'
      if ((gender === 'Woman' && intersex) || (gender === 'Woman' && roll > 90)) gender = 'Masculine woman'
      if ((gender === 'Man' && intersex) || (gender === 'Man' && roll > 90)) gender = 'Feminine man'
      if (gender === 'Woman') gender = 'Feminine woman'
      if (gender === 'Man') gender = 'Masculine man'
    }
    return gender
  }

  /**
   * Marks a characer's death.
   * @param cause {string} - A string indicating the cause of death.
   */

  die (cause = 'natural') {
    this.died = this.present
    if (this.polycule) this.polycule.remove(this)
  }

  /**
   * Marks when a character leaves the community.
   */

  leave () {
    this.left = this.present
    if (this.polycule) this.polycule.remove(this)
  }

  /**
   * Returns the character's age.
   * @param year {number} - Returns how old the character was in this year,
   *   using the earliest of this year, the character's present, the year the
   *   character left the community (if any), and the year the character died
   *   (if known) (Default: `undefined`)
   * @returns {number|undefined} - If the year the character was born is known
   *   and we have some year to measure relative by (either a year is provided,
   *   or the character has a present, or the character left the community and
   *   we've recorded when, or the character died and we've recorded when) then
   *   the character's age at the earliest of those points is returned (for
   *   example, if a character is born in 2300, and leaves the community in
   *   2325, then if you ask for the character's age in 2350, you'll get `25`,
   *   the last time at which we saw him, and not `50`, the age that he might
   *   be if we assume he's still alive somewhere).
   */

  getAge (year= undefined) {
    const { born, died, left, present } = this
    const years = []
    if (typeof year === 'number') years.push(year)
    if (typeof died === 'number') years.push(died)
    if (typeof left === 'number') years.push(left)
    if (typeof present === 'number') years.push(present)
    const mark = Math.min(...years)
    return born && mark ? mark - born : undefined
  }

  /**
   * Ages a character.
   * @param community {Community} - (Optional) The community object.
   */

  age (community= undefined) {
    this.present++
    const age = this.getAge(this.present)
    if (age) {
      const hasProblems = community ? community.hasProblems() : false
      this.body.adjustFertility(hasProblems, age)

      // Check for death, injury, or illness
      if (this.body.checkForDyingOfOldAge(age)) this.die('natural')
      if (!this.died) {
        let chanceOfInjury = 8 * (this.personality.chance('openness') / 50)
        if (random.int(1, 1000) < chanceOfInjury) this.body.getHurt()
        // TODO: Create a history class, and report to it when a character gets hurt.
        // TODO: If there's a conflict, see if character gets hurt in it.

        let chanceOfIllness = 8 * (this.personality.chance('openness') / 50)
        if (random.int(1, 1000) < chanceOfIllness) this.body.getSick()
        // TODO: Create a history class, and report to it when a character gets sick.
        // TODO: If it's a time of sickness, see if character gets sick b/c of it.
        // TODO: If it's lean times, see if character gets sick b/c of it.
      }

      // People change
      const partners = this.polycule && this.polycule.constructor && this.polycule.constructor.name === 'Polycule'
        ? this.polycule.getOthers(this)
        : []
      if (!this.died) this.personality.change(community, partners)

      // TODO: Relationships and skills.
    }
  }
}
