import random from 'random'

import Body from './body'
import Community from './community'
import Genotype from './genotype'
import History from './history'
import Personality from './personality'
import Sexuality from './sexuality'
import Skills from './skills'

import tables from '../../data/community-creation'

import { pickRandom, checkTable } from './utils'
import {
  isPopulatedArray,
  daysFromNow,
  randomDayOfYear,
  get,
  clone,
  randomValFromNormalDistribution
} from '../../shared/utils'

export default class Person {
  constructor (...args) {
    this.history = new History()
    this.skills = new Skills()

    const numbers = args.filter(a => !isNaN(a))
    if (isPopulatedArray(numbers)) this.born = randomDayOfYear(numbers[0])

    const people = args.filter(a => a instanceof Person)
    if (isPopulatedArray(people) && people.length === 1) {
      this.singleParent(people[0])
    } else if (isPopulatedArray(people)) {
      this.birth(...people)
    } else {
      this.setGenes()
    }

    let community
    const communities = args.filter(a => a instanceof Community)
    if (isPopulatedArray(communities)) {
      community = communities[0]
      community.add(this)
    }

    if (!this.born) this.born = daysFromNow(144000)
    this.present = this.born.getFullYear()
    const event = { tags: [ 'born' ] }
    if (!this.genotype.viable) {
      const report = this.die('stillborn')
      event.tags = [ ...event.tags, ...report.tags, 'stillborn' ]
    }
    this.history.add(this.present, event)

    const genders = get(community, 'traditions.genders') || 3
    this.assignGender(genders)
    this.assignAttraction()
  }

  /**
   * Establish the person's genes.
   * @param genes {Genotype} - A Genotype object to set.
   */

  setGenes (genes = new Genotype()) {
    this.genotype = genes
    this.body = Body.copy(genes.body)
    this.personality = Personality.copy(genes.personality)
    this.sexuality = new Sexuality(this.body, this.personality)
    this.intelligence = genes.intelligence
  }

  /**
   * If we only know of one parent (or if we have a bunch of parents but we
   * can't line up a mother and father), then we can kinda represent descent
   * from that single parent.
   * @param parent {Person} - The known parent.
   */

  singleParent (parent) {
    const b = Body.copy(parent.genotype.body)
    const p = Personality.copy(parent.genotype.personality)
    const genes = new Genotype(b, p)
    genes.modify()
    this.setGenes(genes)

    if (parent.id && parent.body.female) {
      this.mother = parent.id
    } else if (parent.id && parent.body.male) {
      this.father = parent.id
    }
  }

  /**
   * Initialize this person with values derived from her parents.
   * @param parents {Person} - An array of parents.
   */

  birth (...parents) {
    const potentialMothers = parents.filter(p => p.body.female && !p.body.infertile && p.body.fertility > 0)
    const potentialFathers = parents.filter(p => p.body.male && !p.body.infertile && p.body.fertility > 0)
    let mother, father

    for (let m = 0; m < potentialMothers.length; m++) {
      mother = potentialMothers[m]
      for (let f = 0; f < potentialFathers.length; f++) {
        if (potentialFathers[f] !== m) {
          father = potentialFathers[f]
          break
        }
      }
      if (mother && father) { break } else { mother = undefined; father = undefined }
    }

    if (mother && father) {
      if (mother.id) this.mother = mother.id
      if (father.id) this.father = father.id
      this.setGenes(Genotype.descend(mother.genotype, father.genotype))
    } else {
      this.singleParent(pickRandom(parents))
    }
  }

  /**
   * Assign gender.
   * @param genders {number} - Optional. The number of genders recognized by
   *   this community (Default: `3`).
   */

  assignGender (genders = 3) {
    const roll = random.int(1, 100)
    const { male, female } = this.body
    const both = male && female
    const neither = !male && !female
    const intersex = both || neither
    let gender = this.body.male ? 'Man' : 'Woman'
    if (roll === 100) gender = gender === 'Man' ? 'Woman' : 'Man'
    if (genders === 3) {
      if (roll > 90 || (intersex && roll > 10)) gender = 'Third gender'
    } else if (genders > 3) {
      if (genders > 4 && (roll > 95 || (intersex && roll > 10))) gender = 'Fifth gender'
      if ((gender === 'Woman' && intersex) || (gender === 'Woman' && roll > 90)) gender = 'Masculine woman'
      if ((gender === 'Man' && intersex) || (gender === 'Man' && roll > 90)) gender = 'Feminine man'
      if (gender === 'Woman') gender = 'Feminine woman'
      if (gender === 'Man') gender = 'Masculine man'
    }
    this.gender = gender
  }

  /**
   * Assigns an attraction matrix to this person. Starts with a baseline based
   * on gender, but then adds random personal variation.
   */

  assignAttraction () {
    const traits = Personality.getTraitList()
    const factors = [ 'attractiveness', ...traits ]
    let table = clone(tables.encounterFactors[this.gender])

    // Does physical attractiveness matter more or less to you?
    const deltaVals = []
    for (let i = -5; i < 6; i++) deltaVals.push(i)
    const attractivenessDelta = pickRandom(deltaVals)
    const attractivenessSwap = pickRandom(traits)
    table.forEach(r => {
      if (r.event === 'attractiveness') r.chance = r.chance + attractivenessDelta
      if (r.event === attractivenessSwap) r.chance = r.chance - attractivenessDelta
    })

    // Do various personality traits matter more or less to you?
    traits.forEach(trait => {
      const posDeltaVals = []
      for (let i = 1; i < 6; i++) posDeltaVals.push(i)
      if (this.personality.check(trait)) {
        const delta = pickRandom(posDeltaVals)
        let swap = trait
        while (swap === trait) swap = pickRandom(factors)
        table.forEach(r => {
          if (r.event === trait) r.chance = r.chance + delta
          if (r.event === swap) r.chance = r.chance - delta
        })
      }
    })

    this.attraction = table
  }

  /**
   * Returns the character's age.
   * @param year {number} - Optional. If provided, returns the character's age
   *   in this year. Otherwise, gives the character's age in her own present,
   *   in the year of her death, or in the year she left the community,
   *   whichever happened first.
   * @returns {number} - The character's age (either as of the year given, or
   *   as of her current present or the year she died or left).
   */

  getAge (year) {
    const { born, died, left, present } = this
    const years = []
    if (!isNaN(year)) years.push(year)
    if (!isNaN(present)) years.push(present)
    if (!isNaN(died)) years.push(died)
    if (!isNaN(left)) years.push(left)
    const index = Math.min(...years)
    return index - born.getFullYear()
  }

  /**
   * Processes the character suffering a bout of illness.
   * @param tags {[string]} - Optional. An array of strings that should be
   *   added to the sickness event's tags (e.g., if this is an infection from a
   *   wound, or if it was part of an outbreak sweeping through the community).
   */

  getSick (tags = []) {
    const outcome = this.body.getSick()
    outcome.tags = [ ...outcome.tags, ...tags ]
    if (outcome.prognosis === 'death') {
      const death = this.die('illness')
      outcome.cause = death.cause
      outcome.tags = [ ...outcome.tags, ...death.tags ]
    }
    this.history.add(this.present, outcome)
  }

  /**
   * Processes the character suffering an injury.
   * @param tags {[string]} - Optional. An array of strings that should be
   *   added to the injury event's tags (e.g., if this happened as part of a
   *   conflict the community is engaged in).
   */

  getHurt (tags = []) {
    const outcome = this.body.getHurt()
    outcome.tags = [ ...outcome.tags, ...tags ]
    if (outcome.lethal || outcome.prognosis === 'death') {
      const death = this.die('injury')
      outcome.lethal = true
      outcome.cause = outcome.tags.includes('infection') ? 'infection' : 'injury'
      outcome.tags = [ ...outcome.tags, ...death.tags ]
    }
    this.history.add(this.present, outcome)
  }

  /**
   * Have an encounter with a person. Did you like that person? This is based
   * on your attraction matrix.
   * @param person {Person} - The person you're encountering.
   * @return {boolean} - `true` if you liked the person you met, or `false` if
   *   you did not.
   */

  encounter (person) {
    if (!this.attraction) this.assignAttraction()
    const criterion = checkTable(this.attraction, random.int(1, 100))
    let chance
    switch (criterion) {
      case 'attractiveness':
        chance = randomValFromNormalDistribution(person.body.attractiveness)
        break
      case 'neuroticism':
        chance = 100 - person.personality.chance('neuroticism')
        break
      default:
        chance = person.personality.chance(criterion)
        break
    }
    return random.int(1, 100) < chance
  }

  /**
   * Applies the various checks for changes to a character's body when she ages
   * through a year (e.g., changes to fertility, whether or not she dies of old
   * age, and whether or not she gets hurt or sick).
   * @param community {Community} - The Community that this person belongs to.
   */

  ageBody (community = undefined) {
    const age = this.getAge()
    const troubledTimes = community ? community.hasProblems() : false
    this.body.adjustFertility(troubledTimes, age)

    if (this.body.checkForDyingOfOldAge(age)) {
      this.history.add(this.present, this.die())
    } else {
      const status = community && community.status ? community.status : { conflict: false, sick: false, lean: false }
      const { conflict, sick, lean } = status

      // There's a certain likelihood of injury even in the best of times,
      // and the more open you are to new experiences, the more adventurous
      // you are, the more likely it is to happen.

      const chanceOfInjury = 8 * (this.personality.chance('openness') / 50)
      if (random.int(1, 1000) < chanceOfInjury) this.getHurt()

      // But when your community is embroiled in a conflict, your chances of
      // getting hurt increase substantially.

      if (conflict && random.int(1, 1000) < chanceOfInjury * 4) this.getHurt([ 'conflict' ])

      // When times are lean, you're forced to push longer and harder to find
      // food. You have to take more chances, and that leads to more injuries.

      if (lean && random.int(1, 1000) < chanceOfInjury * 2) this.getHurt()

      // Likewise, there's a certain likelihood of getting sick even in the
      // best of times, and again, the more adventurous you are, the more
      // likely you are to get yourself into the sort of situation where you're
      // more likely to get sick.

      const chanceOfIllness = 12 * (this.personality.chance('openness') / 50)
      if (random.int(1, 1000) < chanceOfIllness) this.getSick()

      // If something's going around, of course, you're much more likely to
      // catch it.

      if (sick && random.int(1, 1000) < chanceOfIllness * 10) this.getSick([ 'outbreak' ])

      // In lean times, you're not eating as well as you should and your immune
      // response is compromised, so you're more likely to get sick.

      if (lean && random.int(1, 1000) < chanceOfIllness * 2) this.getHurt()
    }
  }

  /**
   * Ages a character through one year.
   * @param community {Community} - The Community that this person belongs to.
   */

  age (community = undefined) {
    this.present++
    this.ageBody(community)
  }

  /**
   * Marks when a character leaves the community.
   * @param crime {string} - Optional. If defined, the character did not leave
   *   the community of her own volition, but was exiled for committing some
   *   crime (usually murder or attempted murder). This string is a single word
   *   or very short phrase to describe the crime. It should be usable as a
   *   consistent tag (e.g., 'murder' or 'attempted murder').
   *   (Default: `undefined`)
   * @returns {Object} - An event object suitable for adding to a history.
   */

  leave (crime = undefined) {
    const year = this.present
    this.left = year
    const entry = { tags: [ 'left' ] }
    if (crime) { entry.tags.push('exile'); entry.crime = crime }
    return entry
  }

  /**
   * Marks the character as dead.
   * @param cause {string} - Optional. The cause of death (Default: `natural`).
   * @param killer {string} - The key of the person who killed this character,
   *   if this character was killed by someone.
   * @returns {Object} - A report object suitable for adding to the character's
   *   personal history.
   */

  die (cause = 'natural', killer) {
    const year = this.present
    this.died = year
    const event = { tags: [ 'died' ], cause }
    const k = killer instanceof Person && killer.id ? killer.id : typeof killer === 'string' ? killer : false
    if (k) event.killer = k
    return event
  }
}
