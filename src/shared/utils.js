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
  while (val && props.length) {
    val = val[props.shift()]
  }
  return val !== undefined
}

export {
  checkExists
}