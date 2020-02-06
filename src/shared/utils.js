/**
 * This method ensures that a chain of properties exist. For example, if you
 * need to use a value like `obj.prop1.prop2.prop3`, and it's possible that any
 * of those properties might be missing, you can pass `obj` as the `val`
 * argument, and `'prop1.prop2.prop3` as the `props` argument, and if all
 * three properties exist, the method will return true. Used for providing
 * data integrity checks.
 * @param val {Object} - An object to check properties for.
 * @param props {string} - A string representing the chain of properties to
 *  check.
 * @returns {boolean} - `true` if the chain of properties exists, or `false`
 *   if they do not.
 */

const checkExists = (val, props) => {
  props = props.split('.')
  while (val && props.length) val = val[props.shift()]
  return val !== undefined
}

/**
 * Returns true if the given object is an array with at least one item in it,
 * or false otherwise.
 * @param obj {*} - An object to test.
 * @returns {boolean} - `true` if the object provided is an array with at least
 *   one item in it, or `false` if it is not.
 */

const isPopulatedArray = obj => Boolean(obj && Array.isArray(obj) && obj.length > 0)

/**
 * Returns `true` if each element in the given array is true.
 * @param arr {Array} - An array to evaluate.
 * @returns {*} - `true` if each element in `arr` is true, or `false` if it is
 *   not.
 */

const allTrue = arr => arr && Array.isArray(arr) && arr.reduce((acc, curr) => acc && Boolean(curr), true)

/**
 * If you have a value nested deep inside of an object (e.g., `obj.p1.p2.p3`),
 * but it's possible that any of those values might not exist (e.g., `obj` may
 * have a `p1` property, but that might not have a `p2` property, etc.), this
 * method allows you to pass in the object and a string representing the chain
 * path to the value you're looking for. It will return the value of that prop-
 * erty, if it exists, or `undefined` if it does not.
 * @param val {Object} - An object that you expect to contain a property.
 * @param props {string} - A string representing the chain path to a value.
 *   For example, if you want to find `obj.p1.p2.p3`, you would pass `obj` as
 *   the `val` parameter, and `'p1.p2.p3'` as the `props` parameter.
 * @returns {*} - The value of the property if it exists, or `undefined` if it
 *   does not.
 */

const get = (val, props) => {
  props = props.split('.')
  while (val && props.length) val = val[props.shift()]
  return val
}

/**
 * Formats a date object in the format used in page history tables.
 * @param date {Date} - A Date object.
 * @returns {string} - The data object represented in the format used in page
 *   history tables.
 */

const formatDate = date => {
  const months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
  const d = date.getDate()
  const m = months[date.getMonth()]
  const y = date.getFullYear()
  const H = date.getHours()
  const hr = H > 12 ? H - 12 : H === 0 ? 12 : H
  const min = date.getMinutes().toString().padStart(2, '0')
  const ampm = H >= 12 ? 'PM' : 'AM'
  return `${d}&nbsp;${m}&nbsp;${y} ${hr}:${min}&nbsp;${ampm}`
}

/**
 * Returns a deduplicated version of the array.
 * @param arr {Array} - An array to deduplicate.
 * @returns {any[]} - A deduplicated copy of the array.
 */

const dedupe = arr => {
  return [ ...new Set(arr) ]
}

/**
 * Returns a string expressing the size of a file.
 * @param size {int} - The size of the file in bytes.
 * @returns {string} - The size of the file expressed as a string (e.g.,
 *   3 MB or 72 kB).
 */

const getFileSizeStr = size => {
  if (size < 1000) {
    return `${size} B`
  } else if (size < 1000000) {
    const kb = size / 1000
    return `${Math.round(kb * 10) / 10} kB`
  } else if (size < 1000000000) {
    const mb = size / 1000000
    return `${Math.round(mb * 10) / 10} MB`
  } else if (size) {
    const gb = size / 1000000000
    return `${Math.round(gb * 10) / 10} GB`
  } else {
    return '0 B'
  }
}

/**
 * Returns a deep clone of an object
 * @param obj {any} - An object to clone.
 * @returns {any} - A clone of the object provided.
 */

const clone = obj => {
  const str = obj === undefined ? '{}' : JSON.stringify(obj)
  return JSON.parse(str)
}

/**
 * Wraps a geolocation request in a Promise.
 * @param opts {Object} - Options to pass to the geolocation request.
 * @returns {Promise<unknown>} - A Promise that resolves with the result of a
 *   geolocation request.
 */

const requestLocation = opts => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, opts)
  })
}

/**
 * Sort an array of strings into alphabetical order.
 * @param arr {[string]} - An array of strings.
 * @returns {*} - The array sorted into alphabetical order.
 */

const alphabetize = arr => {
  return arr.sort((a, b) => {
    if (a < b) return -1
    if (b < a) return 1
    return 0
  })
}

/**
 * Returns a date a number of days from the present equal to the days argument
 * provided.
 * @param days {number} - The number of days in the future.
 * @returns {Date|boolean} - The future date specified, or `false` if given an
 *   invalid argument for `days`.
 */

const daysFromNow = days => {
  const d = parseInt(days)
  if (d) {
    let future = new Date()
    future.setDate(future.getDate() + d)
    return future
  } else {
    return false
  }
}

/**
 * Returns the value only if it is between the `min` and `max`. If the value
 * is less than the `min`, it returns the `min`, and if it is more than the
 * `max`, it returns the `max`.
 * @param value {number} - The value to check.
 * @param min {number} - The lowest valid value.
 * @param max {number} - The highest valid value.
 * @returns {number} - A valid value.
 */

const between = (value, min, max) => {
  return Math.max(Math.min(value, max), min)
}

export {
  checkExists,
  isPopulatedArray,
  allTrue,
  get,
  formatDate,
  dedupe,
  getFileSizeStr,
  clone,
  requestLocation,
  alphabetize,
  daysFromNow,
  between
}
