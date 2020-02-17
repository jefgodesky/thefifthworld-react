import History from './history'

import { isPopulatedArray, daysFromNow, randomDayOfYear } from '../../shared/utils'

export default class Person {
  constructor (...args) {
    this.history = new History()

    if (isPopulatedArray(args) && !isNaN(args[0])) {
      this.born = randomDayOfYear(args[0])
    }

    if (!this.born) this.born = daysFromNow(144000)
  }
}
