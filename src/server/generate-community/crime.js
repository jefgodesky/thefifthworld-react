import random from 'random'

import { anyTrue, allTrue, intersection, isPopulatedArray, probabilityInNormalDistribution } from '../../shared/utils'

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
  const { intelligence } = criminal
  const disagreeableness = 100 - criminal.personality.chance('agreeableness')
  const machiavellian = Math.min(intelligence, disagreeableness)
  const trainedDeception = criminal.skills.mastered.includes('Deception')
  const attempts = []

  for (let i = 0; i < investigation; i++) {
    const prob = probabilityInNormalDistribution(machiavellian)
    const checks = [ random.int(1, 100), random.int(1, 100) ]
    const lie = trainedDeception
      ? checks[0] < prob || checks[1] < prob
      : checks[0] < prob
    attempts.push(lie)
  }

  return allTrue(attempts)
}

export {
  considerViolence,
  assaultOutcome,
  evade
}
