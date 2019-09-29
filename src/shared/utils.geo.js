/**
 * Converting latitude and longitude have a lot in common, so here's a common
 * function to reduce repeated code.
 * @param str {number|string} - A latitude or longitude, represented either as
 *   a number, a string of a number, or a string with degrees, minutes, and
 *   seconds.
 * @param dir {string} - A string telling the function whether to read the
 *   string as latitude (`lat`) or longitude (`lon`). Defaults to `lon`.
 * @returns {boolean|number} - If the string can be parsed into a valid value,
 *   that value is returned. If not, returns `false`.
 */

const convertLatLon = (str, dir = 'lon') => {
  let val = str
  const min = dir === 'lat' ? -90 : -180
  const max = dir === 'lat' ? 90 : 180
  const regex = dir === 'lat'
    ? /(\d+)[°|`](\s?(\d+)\'(\s?(\d+)\")?(\s?(\d+)\.(\d+)")?)?[N|S]/
    : /(\d+)[°|`](\s?(\d+)\'(\s?(\d+)\")?(\s?(\d+)\.(\d+)")?)?[E|W]/
  const check = dir === 'lat' ? 'S' : 'W'

  if ((typeof val === 'number') && ((val > max) || (val < min))) {
    val = false
  } else if (typeof val === 'string') {
    let parse = val.match(regex)
    if (parse) {
      let degrees = parse.length > 1 ? parseInt(parse[1]) : 0
      let minutes = parse.length > 3 ? parseInt(parse[3]) : 0
      let seconds = parse.length > 7 ? parse[7] : 0
      if (seconds && parse.length > 8) seconds += '.' + parse[8]
      seconds = parseFloat(seconds)

      if (seconds) minutes += seconds / 60
      if (minutes) degrees += minutes / 60
      if (parse[0].indexOf(check) > -1) degrees = degrees * -1
      val = degrees
    } else {
      parse = parseFloat(val)
      return parse === NaN ? false : parse
    }
  }
  return val
}

/**
 * Can take either a decimal, or a string representation of a decimal, or a
 * string representation of a latitude inn degrees, minutes, and seconds
 * format, and returns the decimal value for that latitude.
 * @param lat {number|string} - A representation of a latitude.
 * @returns {*} - The decimal value for the latitude given, or `false` if it
 *   isn't a latitude.
 */

const convertLat = lat => {
  return convertLatLon(lat, 'lat')
}

/**
 * Can take either a decimal, or a string representation of a decimal, or a
 * string representation of a longitude inn degrees, minutes, and seconds
 * format, and returns the decimal value for that longitude.
 * @param lon {number|string} - A representation of a longitude.
 * @returns {*} - The decimal value for the longitude given, or `false` if it
 *   isn't a longitude.
 */

const convertLon = lon => {
  return convertLatLon(lon, 'lon')
}

/**
 *
 * @param coords {Object} - An object with properties named `lat` and `lon`
 *   containing latitude and longitude for a coordinate.
 * @returns {Object|boolean} - An object with properties named `lat` and `lon`
 *   containing latitude and longitude for a coordinate, where each has been
 *   parsed into a decimal value. Returns `false` if either value could not be
 *   parsed.
 */
const convertCoords = coords => {
  const lat = convertLatLon(coords.lat, 'lat')
  const lon = convertLatLon(coords.lon, 'lon')
  return lat && lon ? { lat, lon } : false
}

export {
  convertLat,
  convertLon,
  convertCoords
}
