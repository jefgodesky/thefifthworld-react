import random from 'random'

import Body from './body'
import Personality from './personality'
import Sexuality from './sexuality'

import { isPopulatedArray, between } from '../../shared/utils'

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
    this.sexuality = new Sexuality(this.body, args.mateFor)
    this.gender = args && args.specifiedGender ? args.specifiedGender : this.assignGender(args.numGenders)

    const randomDistributed = random.normal(0, 1)
    this.intelligence = randomDistributed()
    this.neurodivergent = random.int(1, 100) === 1
    this.psychopath = null
    if (random.int(1, 100) === 1) this.makePsychopath()

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
   * This person is a psychopath. Mark as such and make necessary adjustments
   * to personality scores.
   */

  makePsychopath () {
    if (this.psychopath === null) {
      this.psychopath = 1
      this.personality.openness.value += 1
      this.personality.conscientiousness.value -= 2
      this.personality.extraversion.value += 1
      this.personality.agreeableness.value -= 2
      this.personality.neuroticism.value += 2
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
   * @param canDie {boolean} - Can this person die during this year? This might
   *   be set to false, for example, if we're aging up a potential partner.
   *   (Default: `true`).
   */

  age (community, year, canDie = true) {
    const age = this.body.getAge(year)
    if (age) {
      const hasProblems = community.hasProblems()
      this.body.adjustFertility(hasProblems, age)

      // Check for death, injury, or illness
      if (canDie) this.body.checkForDyingOfOldAge(age)
      if (!this.died && random.int(1, 1000) < 8) this.body.getHurt(canDie)
      if (!this.died && random.int(1, 1000) < 8) this.body.getSick(canDie)
      if (!this.died) this.personality.pickChange(community, Pair.getPartners(this.pairs, this.id))

      if (!this.died && !this.havingBaby) {
        const wantsPartner = this.wantsPartner(hasProblems, year)
        const willFindPartnerAgreeable = this.personality.check('agreeableness')
        const willFindPartnerExtraverted = this.personality.check('extraversion')
        const willFindPartner = wantsPartner && willFindPartnerAgreeable && willFindPartnerExtraverted
        const partner = willFindPartner ? Pair.form(this, community, year) : false

        if (!partner) {
          // TODO: Develop skills.
        }
      }
    }
  }

  /**
   * Determines if the person would like to find a partner.
   * @param hasProblems {boolean} - `true` if the community is facing a problem
   *   (like conflict, sickness, or lean times) at the time that the question
   *   is posed.
   * @param year {number} - The year in which we're asking this question.
   * @returns {boolean} - `true` if this person would like to find a partner,
   *   or `false` if not.
   */

  wantsPartner (hasProblems, year) {
    const age = this.body.getAge(year)
    if (age) {
      // Is the community expecting you to find a partner?
      const expectation = age > 16 && age < 25
        ? between((age - 16) * 10, 0, 100)
        : age > 25
          ? between(100 - ((age - 25) * 3), 0, 100)
          : 0

      // Are you asexual?
      const { androphilia, gynephilia, skoliophilia } = this.sexuality
      const isAce = androphilia + gynephilia + skoliophilia === 0

      // Do you have children or a partner?
      const hasChildren = isPopulatedArray(this.children)
      const hasPartner = isPopulatedArray(this.pairs)

      // We'll initialize with an estimation of desire.
      let chance = (this.personality.extraversion.value + 2) * 19

      if (isAce || age < 16) {
        chance = 0
      } else if (!hasPartner && !hasChildren) {
        // Will you give in to social demands and settle down with someone?
        // Or maybe you want a relationship for yourself?
        const obligation = this.personality.check('agreeableness') ? expectation : expectation / 2
        chance = between(Math.max(chance, obligation), 0, 100)
      } else {
        // We keep our initial value based on desire, but the more partners you
        // already have, the more likely it is that you find satisfaction with
        // them and don't look elsewhere. Even in polygamous societies, most
        // people are still monogamous as a practical matter.
        const numPartners = hasPartner ? this.pairs.length : 0
        for (let i = 0; i < numPartners; i++) chance = chance / 2
      }

      // If the community has problems, there's less time to think about
      // romance, sex, and relationships.
      if (hasProblems) chance = chance / 2

      return random.int(1, 100) < chance
    }
  }
}
