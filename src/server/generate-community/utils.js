import random from 'random'

import { randomValFromNormalDistribution } from '../../shared/utils'

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

/**
 * Returns a value from a normal distribution with a mean derived from the
 * values of two parents. Used to derive an inherited value that's normally
 * distributed, like a Big Five personality trait, intelligence, or body type.
 * @param mother {number} - The mother's value for this trait. Technically, it
 *   doesn't matter in the slightest if this is the mother's value or the
 *   father's value, as long as the next parameter is the other one.
 * @param father {number} - The father's value for this trait. Technically, it
 *   doesn't matter in the slightest if this is the father's value or the
 *   mother's value, as long as the previous parameter is the other one.
 * @param std {number} - Optional. The standard deviation for the normal
 *   distribution (Default: `1`).
 * @returns {number} - A random value selected from the normal distribution
 *   created by the mean of the parents' values and the given standard
 *   deviation.
 */

const inheritNormalDistribution = (mother, father, std = 1) => {
  return randomValFromNormalDistribution((mother + father) / 2, std)
}

/**
 * Reach a consensus between two sides.
 * @param agree {Person[]} - An array of people who agree with the proposal.
 * @param disagree {Person[]} - An array of people who do not agree with the
 *   proposal.
 * @returns {boolean} - `true` if the two sides reach a consensus to adopt the
 *   proposal, or `false` if they reach a consensus to reject the proposal.
 */

const consensus = (agree, disagree) => {
  while (agree.length > 0 && disagree.length > 0) {
    const oratorsAgree = agree.filter(p => p.skills.mastered.includes('Communication')).length
    const oratorsDisagree = disagree.filter(p => p.skills.mastered.includes('Communication')).length
    const argumentsFor = agree.length + oratorsAgree
    const argumentsAgainst = disagree.length + oratorsDisagree
    const swayedFor = disagree.filter(p => p.personality.check('agreeableness', argumentsFor, 'or'))
    const swayedAgainst = agree.filter(p => p.personality.check('agreeableness', argumentsAgainst, 'or'))
    agree = [ ...agree.filter(p => !swayedAgainst.includes(p)), ...swayedFor ]
    disagree = [ ...disagree.filter(p => !swayedFor.includes(p)), ...swayedAgainst ]
  }
  return agree.length > 0
}

export {
  checkTable,
  rollTableUntil,
  shuffle,
  pickRandom,
  inheritNormalDistribution,
  consensus
}
