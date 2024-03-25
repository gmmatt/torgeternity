/**
 *
 * @param {boolean} unskilledUse Can the skill be used unskilled?
 * @param {string} baseAttribute the attribute the skill is based on
 * @param {string} groupName the group the skill belongs to
 * @returns {object} Schema for a skill
 */
export function makeSkillFields(unskilledUse, baseAttribute, groupName) {
  const fields = foundry.data.fields;
  return {
    adds: new fields.NumberField({ initial: 0, integer: true }),
    baseAttribute: new fields.StringField({ initial: baseAttribute }),
    groupName: new fields.StringField({ initial: groupName }),
    isFav: new fields.BooleanField({ initial: false }),
    isThreatSkill: new fields.BooleanField({ initial: false }),
    defenseOnly: new fields.BooleanField({ initial: false }),
    unskilledUse: new fields.NumberField({
      initial: unskilledUse ? 1 : 0,
      integer: true,
    }),
  };
}
