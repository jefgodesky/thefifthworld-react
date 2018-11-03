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

export {
  checkExists,
  get
}