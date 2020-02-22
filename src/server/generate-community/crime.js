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

export {
  considerViolence
}
