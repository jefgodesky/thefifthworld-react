import random from 'random'

/**
 * Checks for a result on a random table.
 * @param table {Array} - The random table to check. This expects an array of
 *   objects. Each object should have a property called `chance` with an
 *   integer, which is the chance of this event, and a property called `event`,
 *   which is what is returned if the event is selected.
 * @param roll {number} - Optional. The number to check against the table
 *   (Default: A random integer between 1 and 100).
 * @returns {Any} - Returns the `event` property of the item in the `table`
 *   provided that matches the `roll`, or `false` if something goes wrong.
 */

const checkTable = (table, roll = random.int(1, 100)) => {
  let total = 0
  let index = 0
  while (total < 100 && index < table.length) {
    if (roll <= total + table[index].chance) {
      return table[index].event
    } else {
      total = total + table[index].chance
      index++
    }
  }
  return false
}

/**
 * Runs checks until it gets an acceptable result.
 * @param table {[Object]} - The random table to check. This expects an array of
 *   objects. Each object should have a property called `chance` with an
 *   integer, which is the chance of this event, and a property called `event`,
 *   which is what is returned if the event is selected.
 * @param unacceptable {[*]} - An array of values that are not acceptable. If
 *   an unacceptable value is found, it will simply try again until it finds an
 *   acceptable one. Returns `false` if there are no unacceptable responses
 *   possible. (Default: `[]`)
 * @returns {*} - A randomly chosen value from the table.
 */

const rollTableUntil = (table, unacceptable = []) => {
  let result = false
  const acceptable = table.filter(option => !unacceptable.includes(option.event))
  if (acceptable.length > 0) {
    while (!result || unacceptable.includes(result)) {
      result = checkTable(table, random.int(1, 100))
    }
  }
  return result
}

/**
 * Shuffles the array.
 * @param arr {Array} - The array to shuffle.
 * @returns {*} - The shuffled array.
 */

const shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Picks a random element from an array.
 * @param arr {Array} = The array to pick an element from.
 * @returns {*} - A random element from the array.
 */

const pickRandom = arr => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export {
  checkTable,
  rollTableUntil,
  shuffle,
  pickRandom
}
