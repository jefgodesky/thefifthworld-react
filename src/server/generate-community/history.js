import { dedupe, isPopulatedArray } from '../../shared/utils'

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

  /**
   * Return a combined history.
   * @param histories {[History]} - An array of History objects.
   * @returns {History} - A single history that combines the events from the
   *   histories given.
   */

  static combine (...histories) {
    const arr = histories.filter(h => h.constructor && h.constructor.name === 'History')
    const combined = new History()
    arr.forEach(history => {
      Object.keys(history.record).forEach(year => {
        history.record[year].forEach(event => {
          combined.add(year, event)
        })
      })
    })

    // There may be instances where the same event appears in more than one of
    // the histories that we're combining. When that happens, we only want one
    // instance of the event in our combined history.
    Object.keys(combined.record).forEach(year => {
      combined.record[year] = dedupe(combined.record[year])
    })

    return combined
  }
}
