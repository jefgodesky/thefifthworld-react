import { clone, dedupe, isPopulatedArray } from '../../shared/utils'

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
    this.record[year] = dedupe([ ...existing, event ])
  }

  /**
   * Return the earliest year in the history.
   * @returns {number} - The earliest year in the history.
   */

  getEarliest () {
    const years = Object.keys(this.record).map(y => parseInt(y)).filter(y => !isNaN(y))
    return isPopulatedArray(years) ? Math.min(...years) : undefined
  }

  /**
   * Return the latest year in the history.
   * @returns {number} - The latest year in the history.
   */

  getLatest () {
    const years = Object.keys(this.record).map(y => parseInt(y)).filter(y => !isNaN(y))
    return isPopulatedArray(years) ? Math.max(...years) : undefined
  }

  /**
   * Returns the events recorded for a given year.
   * @param year {number} - The year to return events for.
   * @returns {[Object]} - An array of events that occurred in that year.
   */

  getYear (year) {
    const events = this.record[year] ? clone(this.record[year]) : []
    return events.map(e => { e.year = year; return e })
  }

  /**
   * Return the events recorded for a range of years.
   * @param years {[number]} - An array of years. The smallest number in this
   *   array is the starting year, and the largest number in this array is the
   *   ending year.
   * @returns {[Object]} - An array of event objects that occurred within the
   *   range of years given.
   */

  getYears (years) {
    let events = []
    const numbers = years.filter(y => !isNaN(y))
    if (numbers.length > 0) {
      const min = Math.min(...years)
      const max = Math.max(...years)
      for (let y = min; y <= max; y++) {
        events = [...events, ...this.getYear(y)]
      }
    }
    return events
  }

  /**
   * Returns events that match given criteria.
   * @param query {Object} - An object that defines the criteria for the events
   *   to return. Expected properties are one or more of the following:
   *   - `tags`: Only return those events that have one or more of the tags
   *       provided.
   *   - `year`: Either a number or an array of two numbers. If given a single
   *       number, returns only those events that occurred in that year. If
   *       given an array, returns only those events that occurred in one of
   *       those years or between them.
   *   If given both `tags` and `year`, only those events which match both
   *   criteria are returned.
   * @returns {[Object]} - An array of event objects that match the criteria
   *   provided by the `query`.
   */

  get (query) {
    const given = {
      year: Boolean(query.year) && !isNaN(query.year),
      years: Boolean(query.year) && isPopulatedArray(query.year)
    }

    if (given.years) {
      return this.getYears(query.year)
    } else if (given.year) {
      return this.getYear(query.year)
    }
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
