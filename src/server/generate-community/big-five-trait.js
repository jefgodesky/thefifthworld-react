import random from 'random'

export default class BigFiveTrait {
  constructor () {
    const rand = random.normal(0, 1)
    this.value = rand()
  }

  /**
   * Increase or decrease the value by a random amount.
   * @param dir {number} - If given a number greater than zero, a random amount
   *   is added to the value. Otherwise, a random amount is subtracted from the
   *   value.
   */

  change (dir) {
    const rand = random.normal(0, 0.25)
    const d = Math.abs(rand())
    const delta = dir > 0 ? d : d * -1
    this.value += delta
  }

  /**
   * Increase the value by a random amount.
   */

  incr () {
    this.change(1)
  }

  /**
   * Decrease the value by a random amount.
   */

  decr () {
    this.change(-1)
  }

  /**
   * Returns the difference between this trait's value and another trait's
   * value.
   * @param other {BigFiveTrait} - Another instance of `BigFiveTrait` to
   *   compare against.
   * @returns {number} - The difference between this trait's value and the
   *   other trait's value.
   */

  distance (other) {
    return Math.abs(this.value - other.value)
  }
}
