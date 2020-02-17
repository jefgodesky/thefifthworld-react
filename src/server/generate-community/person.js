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
}
