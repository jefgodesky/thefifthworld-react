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
   *   (a number), `tag` (a string), and `tags` (an array of strings). If a
   *   `year` is provided, only those entries that match that year are
   *   returned. If either a `tag` or an array of `tags` is provided, only
   *   those entries that match at least one of the provided tags is returned.
   *   If both a year and one or more tags are provided, only those entries
   *   that match both the year and at least one tag are returned.
   * @returns {[Object]} - An array of matching entries.
   */

  get (params) {
    const { year } = params
    const tag = params.tag ? [ params.tag ] : []
    const tags = params.tags && isPopulatedArray(params.tags) ? params.tags : []
    const t = [ ...tags, ...tag ]
    const tagsProvided = t.length > 0
    const yearAndTags = year && tagsProvided

    if (yearAndTags) {
      // We're given both a year and one or more tags, so return only those
      // entries that are from that year and also have one or more of the
      // tags provided.
      return this.record.filter(e => {
        const intersection = e.tags.filter(x => t.includes(x))
        return e.year === year && intersection.length > 0
      })
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
