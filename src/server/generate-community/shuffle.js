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
  shuffle,
  pickRandom
}
