import random from 'random'

import Community from './community'
import Person from './person'

import tables from '../../data/community-creation'

import { dedupe, isPopulatedArray } from '../../shared/utils'
import { adultery } from './crime'
import { checkTable } from './utils'

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

const commitAdultery = (...parties) => {
  const adulterers = parties.filter(p => p instanceof Person)
  const communities = parties.filter(p => p instanceof Community)
  const community = isPopulatedArray(communities) ? communities[0] : null
  const polycules = dedupe(adulterers.map(p => p.polycule).filter(p => Boolean(p))).map(id => community.polycules[id])
  const year = Math.max(...adulterers.map(p => p.present))

  if (community) {
    const report = adultery(...adulterers, community)
    polycules.forEach(polycule => {
      const times = report.lethal ? 10 : report.tags.includes('assault') ? 5 : 1
      const rolls = []
      for (let i = 0; i < times; i++) rolls.push(random.int(1, 100))
      const outcome = checkTable(tables.cheatingOutcomes, Math.min(...rolls))

      switch (outcome) {
        case 'breakup':
          polycule.breakup(community, report)
          break
        case 'ejected':
          const insiders = adulterers.filter(p => polycule.people.includes(p.id))
          insiders.forEach(insider => { polycule.remove(insider, community, report) })
          break
        case 'recovery':
          polycule.history.add(year, Object.assign({}, report, { outcome }))
      }
    })
  }
}

export {
  encounter,
  commitAdultery
}
