/**
 * Can take either a decimal, or a string representation of a decimal, or a
 * string representation of a latitude inn degrees, minutes, and seconds
 * format, and returns the decimal value for that latitude.
 * @param lat {number|string} - A representation of a latitude.
 * @returns {*} - The decimal value for the latitude given, or `false` if it
 *   isn't a latitude.
 */

const convertLat = lat => {
  let val = lat
  if ((typeof val === 'number') && ((val > 90) || (val < -90))) {
    // It's a number, but not a valid one.
    val = false
  } else if (typeof val === 'string') {
    let parse = val.match(/(\d+)[°|`]\s?(\d+)\'s?(\d+)?(.\d+)?\"?[N|S]?/)
    if (parse) {
      let degrees = parse.length > 1 ? parseInt(parse[1]) : 0
      let minutes = parse.length > 2 ? parseInt(parse[2]) : 0
      let seconds = parse.length > 3 ? parse[3] : 0
      if (seconds && parse.length > 4) seconds += parse[4]
      seconds = parseFloat(seconds)

      if (seconds) minutes += seconds / 60
      if (minutes) degrees += minutes / 60
      val = degrees
    } else {
      parse = parseFloat(val)
      return parse === NaN ? false : parse
    }
  }
  return val
}

export {
  convertLat
}
