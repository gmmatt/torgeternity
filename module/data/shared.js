/**
 *
 * @param {boolean} unskilledUse Can the skill be used unskilled?
 * @param {string} baseAttribute the attribute the skill is based on
 * @param {string} groupName the group the skill belongs to
 * @returns {object} Schema for a skill
 */
export function makeSkillFields(unskilledUse, baseAttribute, groupName) {
  const fields = foundry.data.fields;
  return new fields.SchemaField({
    adds: new fields.NumberField({ initial: 0, integer: true }),
    baseAttribute: new fields.StringField({ initial: baseAttribute }),
    groupName: new fields.StringField({ initial: groupName }),
    isFav: new fields.BooleanField({ initial: false }),
    isThreatSkill: new fields.BooleanField({ initial: false }),
    defenseOnly: new fields.BooleanField({ initial: false }),
    unskilledUse: new fields.BooleanField({ initial: unskilledUse }),
  });
}

export function migrateCosm(cosm) {
  if (!cosm)
    return 'none'
  else if (Object.hasOwn(CONFIG.torgeternity.cosmTypes, cosm))
    return cosm;
  else if (Object.hasOwn(CONFIG.torgeternity.cosmTypeFromLabel, cosm))
    return CONFIG.torgeternity.cosmTypeFromLabel[cosm];

  console.log(`Invalid Cosm: ${cosm}`);
  return 'none';
}