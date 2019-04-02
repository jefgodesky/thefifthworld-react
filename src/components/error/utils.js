/**
 * Returns true if two error objects are the same.
 * @param e1 {object} - An error object to compare.
 * @param e2 {object} - An error object to compare.
 * @returns {boolean} - `true` if `e1` and `e2` are equal, or `false` if not.
 */

const isSameError = (e1, e2) => {
  return (e1.field === e2.field) && (e1.code === e2.code) && (e1.value === e2.value)
}

/**
 * Returns `true` if the error given is already in the array of errors given,
 * or `false` if it is not.
 * @param err {object} - An error object to check for.
 * @param arr {array} - An array of error objects to check.
 * @returns {boolean} - `true` if the error given is already in the array of
 *   errors in the component state, or `false` if it is not.
 */

const isKnownError = (err, arr) => {
  const check = arr && Array.isArray(arr)
    ? arr.filter(e => isSameError(err, e))
    : []
  return (check.length > 0)
}

/**
 * Returns an array with all of the elements of the given array, plus the error
 * object given, if that error object is not already found in it.
 * @param err {object} - An error object to add to the array.
 * @param arr {array} - An array of error objects.
 * @returns {array} - An array of error objects with the given error object
 *   added, unless it was already included.
 */

const addError = (err, arr) => {
  if (!isKnownError(err)) {
    if (arr && Array.isArray(arr)) {
      return [ ...arr, err ]
    } else {
      return [ err ]
    }
  } else {
    return arr
  }
}

/**
 * Removes an error from the array of errors.
 * @param err {object} - An error object to remove from the array of errors.
 * @param arr {array} - An array of error objects.
 * @returns {array} - The original array of errors, sans the error object
 *   provided.
 */

const resolveError = (err, arr) => {
  if (arr && Array.isArray(arr)) {
    return arr.filter(e => !isSameError(err, e))
  } else {
    return []
  }
}

/**
 * Returns an array of errors from the given array of errors that match a given
 * field.
 * @param field {string} - The field to find errors for.
 * @param arr {object} - An array of error objects.
 * @returns {array} - A subset of the given array of errors with only those
 *   objects addressing the field specified.
 */

const getErrorsFor = (field, arr) => {
  return arr && Array.isArray(arr)
    ? arr.filter(err => err.field === field)
    : []
}

export {
  isSameError,
  isKnownError,
  addError,
  resolveError,
  getErrorsFor
}
