import random from 'random'

export default class BigFiveTrait {
  constructor () {
    const rand = random.normal(0, 1)
    this.value = rand()
  }

  /**
   * Reports whether or not the trait value is less than the given threshold.
   * @param x {number} - (Optional) The threshold to compare against. If left
   *   undefined, this defaults to `0`, which is the average value, so that
   *   `isBelow()` can be read as "is below average." (Default: `0`)
   * @returns {boolean} - `true` if the trait value is less than the given
   *   threshold, or `false` if it is greater than or equal to the threshold.
   */

  isBelow (x = 0) {
    return this.value < x
  }

  /**
   * Reports whether or not the trait value is greater than the given
   * threshold.
   * @param x {number} - (Optional) The threshold to compare against. If left
   *   undefined, this defaults to `0`, which is the average value, so that
   *   `isAbove()` can be read as "is above average." (Default: `0`)
   * @returns {boolean} - `true` if the trait value is greater than the given
   *   threshold, or `false` if it is less than or equal to the threshold.
   */

  isAbove (x = 0) {
    return this.value > x
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
