import random from 'random'

import Body from './body'
import Community from './community'
import Genotype from './genotype'
import History from './history'
import Personality from './personality'

import { pickRandom } from './utils'
import { isPopulatedArray, daysFromNow, randomDayOfYear } from '../../shared/utils'

export default class Person {
  constructor (...args) {
    this.history = new History()

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

    const communities = args.filter(a => a instanceof Community)
    if (isPopulatedArray(communities)) communities[0].add(this)

    if (!this.born) this.born = daysFromNow(144000)
    this.present = this.born.getFullYear()
    const event = { tags: [ 'born' ] }
    if (!this.genotype.viable) {
      const report = this.die('stillborn')
      event.tags = [ ...event.tags, ...report.tags, 'stillborn' ]
    }
    this.history.add(this.present, event)
  }

  /**
   * Establish the person's genes.
   * @param genes {Genotype} - A Genotype object to set.
   */

  setGenes (genes = new Genotype()) {
    this.genotype = genes
    this.body = Body.copy(genes.body)
    this.personality = Personality.copy(genes.personality)
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
