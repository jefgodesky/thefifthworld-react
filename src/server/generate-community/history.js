import { isPopulatedArray } from '../../shared/utils'

export default class History {
  constructor () {
    this.record = {}
  }

  /**
   * Adds an event to the historical record.
   * @param year {number} - The year in which this event happens.
   * @param event {object} - An object describing the event.
   */

  add (year, event) {
    const existing = !isNaN(year) && isPopulatedArray(this.record[year]) ? this.record[year] : []
    this.record[year] = [ ...existing, event ]
  }
}
