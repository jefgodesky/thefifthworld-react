/**
 * What happens when two people spend some time together?
 * @param a {Person} - One person.
 * @param b {Person} - The other person.
 * @return {Object} - An object with the following properties:
 *   - `sexual`: A boolean. `true` if `a` and `b` are mutually sexually
 *     attracted to one another, or `false` if they are not.
 *   - `other`: A boolean. `true` if `a` and `b` mutually like one another,
 *     or `false` if they do not.
 *   - `a` and `b`: Objects which each describe the reaction of one person to
 *     the other. These objects have properties `id` (with the person's
 *     community ID, if she has one), `sexual` (`true` if she is sexually
 *     attracted to the other person, or `false` if she is not), and `other`
 *     (`true` if she likes the other person, of `false` if she does not).
 */

const encounter = (a, b) => {
  const report = {
    a: {
      id: a.id,
      sexual: a.sexuality.isAttractedTo(b),
      other: a.encounter(b)
    },
    b: {
      id: b.id,
      sexual: b.sexuality.isAttractedTo(a),
      other: b.encounter(a)
    }
  }
  report.sexual = report.a.sexual && report.b.sexual
  report.other = report.a.other && report.b.other
  return report
}

export {
  encounter
}
