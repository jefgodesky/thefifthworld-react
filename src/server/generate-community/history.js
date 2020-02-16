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
   * Return all events in the history, flattened into a single array of
   * objects. A `year` property is added to each object, providing the year
   * that the event occurred in (which would be in the key in the original
   * `record` object).
   * @returns {[Object]} - An array of event objects.
   */

  getEvents () {
    let events = []
    Object.keys(this.record).forEach(year => {
      const cpy = clone(this.record[year])
      cpy.forEach(e => { e.year = parseInt(year) })
      events = [ ...events, ...cpy ]
    })
    return events
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
    const numbers = years.filter(y => !isNaN(y))
    if (numbers.length > 0) {
      const min = Math.min(...years)
      const max = Math.max(...years)
      return this.getEvents().filter(e => e.year >= min && e.year <= max)
    } else {
      return []
    }
  }

  /**
   * Given an array of events, returns an array of only those events that have
   * one or more of the given tags.
   * @param events {[Object]} - An array of event objects.
   * @param tags {[string]} - An array of tags to search for.
   * @returns {[Object]} - An array of event objects with tags that match the
   *   tags provided.
   */

  static getTags (events, tags) {
    return events.filter(e => {
      const intersection = e.tags.filter(x => tags.includes(x))
      return intersection.length > 0
    })
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
      years: Boolean(query.years) && isPopulatedArray(query.years),
      tag: Boolean(query.tag) && typeof query.tag === 'string',
      tags: Boolean(query.tags) && isPopulatedArray(query.tags)
    }

    const years = given.years && given.year ? [ ...query.years, query.year ] : given.years ? query.years : given.year ? [ query.year ] : []
    const tags = given.tags && given.tag ? [ ...query.tags, query.tag ] : given.tags ? query.tags : given.tag ? [ query.tag ] : []

    const events = isPopulatedArray(years) ? this.getYears(years) : this.getEvents()
    return isPopulatedArray(tags) ? History.getTags(events, tags) : events
  }

  /**
   * Was the given year a quiet, uneventful year in this history?
   * @param year {number} - The year to check.
   * @returns {boolean} - Returns `true` if the history contains no entries for
   *   this year, or `false` if it does.
   */

  wasQuiet (year) {
    return !this.record[year]
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
