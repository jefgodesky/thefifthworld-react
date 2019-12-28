import random from 'random'

import Body from './body'
import Personality from './personality'
import Polycule from './polycule'
import Sexuality from './sexuality'
import Skills from './skills'
import { between } from '../../shared/utils'

export default class Person {
  constructor (args = {}) {
    if (args && args.mother && args.mother.genotype && args.father && args.father.genotype) {
      this.genotype = Body.makeBaby([ args.mother.genotype, args.father.genotype ], args.born) || new Body()
    } else {
      this.genotype = new Body(args)
    }

    if (args.born) this.born = args.born
    this.body = new Body({ copy: this.genotype })
    this.personality = new Personality()
    this.skills = new Skills()
    this.sexuality = new Sexuality(this.body, args.mateFor)
    this.gender = args && args.specifiedGender ? args.specifiedGender : this.assignGender(args.numGenders)

    const randomDistributed = random.normal(0, 1)
    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    if (this.body.psychopath) this.personality.expressPsychopathy()

    this.history = []
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
   * Does this person want a mate?
   * @param year {number} - The year we're asking.
   * @returns {boolean} - Returns `true` if this person would like to find a
   *   mate, or `false` if not.
   */

  wantsMate (year) {
    const age = this.body.getAge(year)
    if (age && age > 15) {
      // Does the community expect her to find a mate?
      const expectation = this.polycule
        ? 0
        : age < 25
          ? between(100 - ((25 - age) * 15), 0, 100)
          : between((50 - age) * 5, 0, 100)

      // Will she comply with the community's wishes?
      let willComply = random.int(1, 100) < expectation
      if (willComply) {
        const checkTimes = this.sexuality.isAsexual() ? 4 : 2
        for (let c = 0; c < checkTimes; c++) willComply = willComply && this.personality.check('agreeableness')
      }
      const pressure = willComply ? expectation / 4 : 0

      // Is she sexually satisfied? How much does that matter to her?
      const sex = this.polycule ? this.polycule.getSexualSatisfaction(this) : 0
      const desire = (this.sexuality.libido - sex) / 2

      // Is she lonely?
      const love = this.polycule ? this.polycule.avg() : 0
      const outgoing = this.personality.chance('extraversion')
      const needy = this.personality.chance('neuroticism')
      const loneliness = between(needy - outgoing - love, 0, 100)

      return random.int(1, 100) < pressure + desire + loneliness
    }
  }

  /**
   * Marks a characer's death.
   * @param cause {string} - A string indicating the cause of death.
   * @param year {number} - The year in which the person died.
   */

  die (cause = 'natural', year = true) {
    this.died = year
    const entry = { event: 'died', cause }
    if (year && typeof year === 'number') entry.year = year
    this.history.push(entry)
  }

  /**
   * Ages a character.
   * @param community {Community} - The community object.
   * @param year {number} - The year that the character is aging through.
   * @param isMate {boolean} - Is this person being aged up as a potential mate
   *   for someone? If so, she can't die, and we'll skip finding mates for her.
   *   (Default: `false`)
   */

  age (community, year, isMate = false) {
    const age = this.body.getAge(year)
    const canDie = !isMate
    if (age) {
      const hasProblems = community.hasProblems()
      this.body.adjustFertility(hasProblems, age)

      // Check for death, injury, or illness
      if (canDie) this.body.checkForDyingOfOldAge(age)
      if (!this.died) {
        let chanceOfInjury = 8 * (this.personality.chance('openness') / 50)
        if (community.status.conflict) chanceOfInjury = chanceOfInjury * 2
        if (random.int(1, 1000) < chanceOfInjury) this.body.getHurt(canDie)

        let chanceOfIllness = 8 * (this.personality.chance('openness') / 50)
        if (community.status.sick) chanceOfIllness = chanceOfIllness * 4
        if (community.status.sick) chanceOfIllness = chanceOfIllness * 2
        if (random.int(1, 1000) < chanceOfIllness) this.body.getSick(canDie)
      }

      // People change
      const partners = this.polycule && this.polycule.constructor && this.polycule.constructor.name === 'Polycule'
        ? this.polycule.getOthers(this)
        : []
      if (!this.died) this.personality.change(community, partners)

      // What are you doing with this year? Are you focusing on forming a new
      // relationship, or on mastering a new skill?

      const wantsMate = this.wantsMate(year)
      const hasMate = this.polycule && this.polycule.people.length > 1
      const havingChild = hasMate && this.polycule && this.polycule.havingChild
      const timeForSkills = (hasMate && !havingChild) || (!hasMate && !wantsMate)
      if (timeForSkills) {
        Skills.advance(this, community)
      } else if (wantsMate && !hasMate) {
        if (!this.polycule) this.polycule = new Polycule(this)
        this.polycule.findNewPartner(community, year)
        if (this.polycule.people.length < 2) delete this.polycule
      }
    }
  }
}
