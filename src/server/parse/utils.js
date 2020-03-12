import config from '../../../config'

/**
 * Returns the absolute URL for an asset on Amazon AWS S3.
 * @param path {string} - The relative path of the asset.
 * @returns {string} - The absolute path for an asset on Amazon AWS S3.
 */

const getURL = path => {
  return `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucket}/${path}`
}

/**
 * Parses the properties or attributes used in a tag into an object, where each
 * attribute is a property, and the value of that attribute is the value of
 * that property.
 * @param tag {string} - The tag string.
 * @returns {Object} - An object representing the tag's properties.
 */

const getProps = tag => {
  const matches = tag.match(/\s(.*?)=(”|")(.*?)(”|")\/?/g)
  const props = {}
  if (matches) {
    for (let match of matches) {
      const pair = match.trim().split('=')
      if (Array.isArray(pair) && pair.length > 1) {
        const key = pair[0].charAt(0).toLowerCase() + pair[0].slice(1)
        const val = pair[1].substr(1, pair[1].length - 2)
        props[key] = val
      }
    }
  }
  return props
}

export {
  getURL,
  getProps
}
