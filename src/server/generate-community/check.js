/**
 * Checks for a result on a random table.
 * @param table {Array} - The random table to check. This expects an array of
 *   objects. Each object should have a property called `chance` with an
 *   integer, which is the chance of this event, and a property called `event`,
 *   which is what is returned if the event is selected.
 * @param roll {number} - The number to check against the table.
 * @returns {Any} - Returns the `event` property of the item in the `table`
 *   provided that matches the `roll`, or `false` if something goes wrong.
 */

const check = (table, roll) => {
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

export {
  check
}
