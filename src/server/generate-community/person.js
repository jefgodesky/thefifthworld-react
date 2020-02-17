import Body from './body'
import Community from './community'
import Genotype from './genotype'
import History from './history'
import Personality from './personality'

import { isPopulatedArray, daysFromNow, randomDayOfYear } from '../../shared/utils'

export default class Person {
  constructor (...args) {
    this.history = new History()

    const numbers = args.filter(a => !isNaN(a))
    if (isPopulatedArray(numbers)) this.born = randomDayOfYear(numbers[0])

    const people = args.filter(a => a instanceof Person)
    if (isPopulatedArray(people) && people.length === 1) {
      this.singleParent(people[0])
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
}
