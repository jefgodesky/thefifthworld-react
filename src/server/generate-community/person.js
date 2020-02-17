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

    this.setGenes()

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
}
