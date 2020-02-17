import Community from './community'
import History from './history'

import { isPopulatedArray, daysFromNow, randomDayOfYear } from '../../shared/utils'

export default class Person {
  constructor (...args) {
    this.history = new History()

    const numbers = args.filter(a => !isNaN(a))
    if (isPopulatedArray(numbers)) this.born = randomDayOfYear(numbers[0])

    const communities = args.filter(a => a instanceof Community)
    if (isPopulatedArray(communities)) communities[0].add(this)

    if (!this.born) this.born = daysFromNow(144000)
    this.present = this.born.getFullYear()
  }
}
