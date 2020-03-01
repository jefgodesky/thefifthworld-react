import random from 'random'

import {
  anyTrue,
  allTrue,
  intersection,
  probabilityInNormalDistribution,
  isPopulatedArray
} from '../../shared/utils'
import { pickRandom } from './utils'

/**
 * Returns a list of crimes committed by this person.
 * @param criminal {Person} - The person whose criminal record we're looking
 *   for.
 * @return {string[]} - An array of strings listing this person's crimes.
 */

const getCrimes = criminal => {
  const crimes = [ 'murder', 'assault' ]
  return criminal.history.get({ tag: 'crime' }).map(entry => {
    if (entry.attacker === criminal.id) {
      const myCrimes = intersection(crimes, entry.tags)
      return isPopulatedArray(myCrimes) ? myCrimes[0] : false
    } else {
      return false
    }
  }).filter(crime => crime !== false)
}

/**
 * Consider assaulting or murdering someone.
 * @param attacker {Person} - The person who is considering an act of violence.
 * @return {string} - Either `attack` if the person decides to attack, `kill`
 *   if she means to kill her, or `no` if she decides against violence.
 */

const considerViolence = (attacker) => {
  const willAttack = !attacker.personality.check('agreeableness', 25, 'or')
  const willKill = !attacker.personality.check('agreeableness', 50, 'or')
  if (willAttack && willKill) {
    return 'kill'
  } else if (willAttack) {
    return 'attack'
  } else {
    return 'no'
  }
}

/**
 * Determines if an attacker is able to successfully injure a defender, or if
 * the defender is able to fend off the attack.
 * @param attacker {Person} - The person who is assaulting the defender.
 * @param defender {Person} - The person being assaulted by the attacker.
 * @returns {boolean} - `true` if the attacker succeeds in doing injury to the
 *   defender, or `false` if the defender successfully fends her off.
 */

const assaultOutcome = (attacker, defender) => {
  const skillsForAttacker = [
    'Deception', 'Sorcery', 'Running', 'Scouting', 'Archery', 'Throwing atlatl darts',
    'Shooting a blowgun', 'Throwing a bola', 'Shooting a sling', 'Using a spear'
  ]
  const skillsForDefender = [ 'Running', 'Scouting' ]
  const attackerSkills = intersection(attacker.skills.mastered, skillsForAttacker)
  const defenderSkills = intersection(defender.skills.mastered, skillsForDefender)
  let attackRolls = []
  for (let a = 0; a < attackerSkills.length + 1; a++) {
    const defenseRolls = []
    for (let d = 0; d < defenderSkills.length + 1; d++) defenseRolls.push(random.boolean())
    attackRolls.push(!anyTrue(defenseRolls))
  }
  attackRolls = attackRolls.sort(a => { return a ? -1 : 1 })
  return attackRolls[0]
}

/**
 * Processes an assault.
 * @param attacker {Person} - The person assaulting the defender.
 * @param defender {Person} - The person being assaulted.
 * @param community {Community} - The community being generated.
 * @param lethalIntent {boolean} - Optional. Does the attacker intend to kill
 *   the defender? (Default: `false`)
 * @param report {boolean} - Optional. If `true`, it returns an object
 *   reporting the details, and does not add anything to the histories of the
 *   people involved (Default: `false`).
 */

const assault = (attacker, defender, community, lethalIntent = false, report = false) => {
  const recentViolentDeaths = community.getRecentViolentDeaths()
  const year = attacker.present
  const outcome = assaultOutcome(attacker, defender)
  const event = {
    tags: [ 'crime', 'assault' ],
    attacker: attacker.id,
    defender: defender.id,
    succeeded: outcome
  }

  if (outcome && lethalIntent) {
    const death = defender.die('murder', community, attacker.id)
    event.tags = [ ...event.tags, 'murder', ...death.tags ]
    event.cause = 'homicide'
    event.discovered = !evade(attacker, 8 * (recentViolentDeaths + 1))
  } else if (outcome) {
    const res = defender.body.getHurt()
    event.tags = [ ...event.tags, ...res.tags ]
    event.location = res.location
    if (res.lethal || res.prognosis === 'death') {
      const death = defender.die('assault', community, attacker.id)
      event.lethal = true
      event.cause = res.tags.includes('infection') ? 'infection' : 'injury'
      event.tags = [ ...event.tags, ...death.tags ]
      event.discovered = !evade(attacker, 8 * (recentViolentDeaths + 1))
    }
  }

  if (report) {
    return event
  } else {
    attacker.history.add(year, event)
    defender.history.add(year, event)
  }
}

/**
 * Respond to an act of adultery.
 * @param subject {Person} - The person who was cheated on and is considering
 *   her response.
 * @param adulterers {Person[]} - An array of the people involved in the act
 *   of adultery that the `subject` is responding to.
 * @param community {Community} - The community that the `subject` belongs to
 *   and the adultery is occurring within.
 * @param report {Object} - An object containing information about the incident
 *   so far.
 * @returns {Object} - the `report` expanded to include the subject's response.
 */

const respondToAdultery = (subject, adulterers, community, report) => {
  const myExclusivePartners = subject.partners.filter(rel => rel.exclusive).map(rel => rel.id)
  const partners = adulterers.filter(a => myExclusivePartners.includes(a.id))
  const partner = isPopulatedArray(partners) ? partners[0] : undefined

  if (partner) {
    if (random.boolean()) {
      const separation = subject.separate(partner, true)
      report = Object.assign({}, report, separation, { tags: [ ...report.tags, ...separation.tags ] })
    } else {
      const violence = considerViolence(subject)
      if (violence !== 'no') {
        const lethal = violence === 'kill'
        const target = pickRandom(adulterers)
        const attack = assault(subject, target, community, lethal, true)
        report = Object.assign({}, report, attack, { tags: [ ...report.tags, ...attack.tags ] })
      } else {
        const rel = subject.partners.filter(rel => rel.id === partner.id)
        if (isPopulatedArray(rel)) rel[0].love -= 5
      }
    }
  }
  return report
}

/**
 * Determines whether or not a criminal can get away with her crime (assuming
 * she even has that opportunity — assault someone who survives, and she'll be
 * able to tell everyone who attacked her).
 * @param criminal {Person} - The person who is trying to get away with the
 *   crime.
 * @param investigation {number} - A numerical rating of how deeply people are
 *   looking into this. People investigate murders more deeply than some light
 *   sabotage, and more significant sabotage more deeply than less significant
 *   acts. If there are a lot of unsolved crimes, they'll investigate more
 *   deeply (Default: `1`).
 * @returns {boolean} - `true` if she gets away with it, or `false` if her
 *   crimes are discovered.
 */

const evade = (criminal, investigation = 1) => {
  const intelligence = criminal.intelligence
  const disagreeableness = criminal.personality.agreeableness * -1
  const machiavellian = Math.min(intelligence, disagreeableness)
  const evasions = []

  for (let i = 0; i < investigation; i++) {
    const prob = probabilityInNormalDistribution(machiavellian)
    const checks = [ random.int(1, 100) < prob, random.int(1, 100) < prob ]
    const lie = criminal.skills.mastered.includes('Deception')
      ? anyTrue(checks)
      : checks[0]
    evasions.push(lie)
  }
  return allTrue(evasions)
}

export {
  getCrimes,
  considerViolence,
  assaultOutcome,
  assault,
  respondToAdultery,
  evade
}
