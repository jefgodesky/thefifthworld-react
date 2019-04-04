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
    ? arr.filter(e => ((e.field === err.field) && (e.code === err.code) && (e.value === err.value)))
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
  const { field, code, value } = err
  if (field && code && value) {
    return arr.filter(e => !((e.field === field) && (e.code === code) && (e.value === value)))
  } else if (field && code) {
    return arr.filter(e => !((e.field === field) && (e.code === code)))
  } else if (field) {
    return arr.filter(e => !(e.field === field))
  } else {
    return arr
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
  isKnownError,
  addError,
  resolveError,
  getErrorsFor
}
