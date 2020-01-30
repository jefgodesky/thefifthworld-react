import { isPopulatedArray } from '../../shared/utils'

export default class History {
  constructor () {
    this.record = []
  }

  /**
   * Add an entry to the record.
   * @param entry {Object} - The entry to add to the record. Expected
   *   properties include `year` (a number) and `tags` (an array of strings).
   */

  add (entry) {
    this.record.push(entry)
  }

  /**
   * Searches the record for matching entries.
   * @param params {Object} - A query object. Expected properties are `year`
   *   (a number), `between` (an array with two numbers), `tag` (a string), and
   *   `tags` (an array of strings). If a `year` is provided, only those
   *   entries that match that year are returned. If `between` is provided (and
   *   the first two elements are numbers), only entries with years that are
   *   between those two values are returned. If either a `tag` or an array of
   *   `tags` is provided, only those entries that match at least one of the
   *   provided tags is returned. If a year or interval of years are provided
   *   as well as a tag or set of tags, entries in the result must match the
   *   years and at least one of the provided tags.
   * @returns {[Object]} - An array of matching entries.
   */

  get (params) {
    const { year, between } = params
    const tag = params.tag ? [ params.tag ] : []
    const tags = params.tags && isPopulatedArray(params.tags) ? params.tags : []
    const t = [ ...tags, ...tag ]
    const tagsProvided = t.length > 0
    const intervalProvided = isPopulatedArray(between) && between.length >= 2 &&
      typeof between[0] === 'number' && typeof between[1] === 'number'
    const intervalAndTags = intervalProvided && tagsProvided
    const yearAndTags = !intervalProvided && year && tagsProvided
    const low = intervalProvided ? Math.min(...between) : undefined
    const high = intervalProvided ? Math.max(...between) : undefined

    if (intervalAndTags) {
      // we're given both an interval and one or more tags, so return only
      // those entries that occur within the given interval and also have one
      // or more of the tags provided.
      return this.record.filter(e => {
        const intersection = e.tags.filter(x => t.includes(x))
        return e.year >= low && e.year <= high && intersection.length > 0
      })
    } else if (yearAndTags) {
      // We're given both a year and one or more tags, so return only those
      // entries that are from that year and also have one or more of the
      // tags provided.
      return this.record.filter(e => {
        const intersection = e.tags.filter(x => t.includes(x))
        return e.year === year && intersection.length > 0
      })
    } else if (intervalProvided) {
      // We're given an interval, so return only the entries that occur within
      // that interval.
      return this.record.filter(e => e.year >= low && e.year <= high)
    } else if (year) {
      // We're given a year, so return only the entries for that year.
      return this.record.filter(e => e.year === year)
    } else if (tagsProvided) {
      // We're given one or more tags, so return only those entries that have
      // one or more of the tags provided.
      return this.record.filter(e => {
        const intersection = e.tags.filter(x => t.includes(x))
        return intersection.length > 0
      })
    } else {
      return this.record
    }
  }
}
