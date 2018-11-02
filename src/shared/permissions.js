/**
 * This method returns whether or not the person provided has a given type of
 * permissions for this page.
 * @param person {Member|null} - This parameter expects a Member object, or
 *   at least an object with the same properties. If given something else, it
 *   will evaluate permissions based on other (world) permissions.
 * @param resource {object} - The resource that we're checking permissions for
 *   (this will usually, if not always, be a Page instance).
 * @param level {int} - This parameter defines the type of permission
 *   requested: 4 to read or 6 to read and write.
 * @returns {boolean} - Returns `true` if the person given has the type of
 *   permissions requested, or `false` if she does not.
 */

const checkPermissions = (person, resource, level) => {
  const p = typeof resource.permissions === 'string'
    ? resource.permissions
    : resource.permissions.toString()
  const owner = parseInt(p.charAt(0))
  const group = parseInt(p.charAt(1))
  const world = parseInt(p.charAt(2))

  if (person && person.admin) {
    return true
  } else if (person && person.id === resource.owner && owner >= level) {
    return true
  } else if (person && group >= level) {
    return true
  } else if (world >= level) {
    return true
  } else {
    return false
  }
}

/**
 * This is a convenience method that can check if a person has read
 *   permissions for the page specifically.
 * @param person {Member|null} - This parameter expects a Member object, or
 *   at least an object with the same properties. If given something else, it
 *   will evaluate permissions based on other (world) permissions.
 * @param resource {object} - The resource that we're checking permissions for
 *   (this will usually, if not always, be a Page instance).
 * @returns {boolean} - Returns `true` if the person given has read
 *   permissions, or `false` if she does not.
 */

const canRead = (person, resource) => {
  return checkPermissions(person, resource, 4)
}

/**
 * This is a convenience method that can check if a person has read and write
 *   permissions for the page specifically.
 * @param person {Member|null} - This parameter expects a Member object, or
 *   at least an object with the same properties. If given something else, it
 *   will evaluate permissions based on other (world) permissions.
 * @param resource {object} - The resource that we're checking permissions for
 *   (this will usually, if not always, be a Page instance).
 * @returns {boolean} - Returns `true` if the person given has read and write
 *   permissions, or `false` if she does not.
 */

const canWrite = (person, resource) => {
  return person ? checkPermissions(person, resource, 6) : false
}

export {
  checkPermissions,
  canRead,
  canWrite
}
