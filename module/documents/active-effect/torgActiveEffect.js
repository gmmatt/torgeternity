/**
 * Extend the basic ActiveEffect model with migrations and TORG specific handling
 */
export default class TorgActiveEffect extends ActiveEffect {
  /**
   *
   * @param {object} data the data object to migrate
   * @returns {object} the migrated data object
   */
  static migrateData(data) {
    if (Object.hasOwn(data, 'changes')) {
      const migrationDictionary = {
        // SK and Threat attribute modifiers
        'system.attributes.charisma': 'system.attributes.charisma.value',
        'system.attributes.mind': 'system.attributes.mind.value',
        'system.attributes.strength': 'system.attributes.strength.value',
        'system.attributes.dexterity': 'system.attributes.dexterity.value',
        'system.attributes.spirit': 'system.attributes.spirit.value',
        // SK and Threat general path cleaning
        'system.other.fatigue': 'fatigue',
        'system.fatigue': 'fatigue',
        'system.unarmedDamage': 'unarmed.damageMod',
        'system.unarmedDamageMod': 'unarmed.damageMod',
        // SK and Threat defense modifiers
        'system.dodgeDefenseMod': 'defenses.dodge.mod',
        'system.meleeWeaponsDefenseMod': 'defenses.meleeWeapons.mod',
        'system.unarmedCombatDefenseMod': 'defenses.unarmedCombat.mod',
        'system.intimidationDefenseMod': 'defenses.intimidation.mod',
        'system.maneuverDefenseMod': 'defenses.maneuver.mod',
        'system.tauntDefenseMod': 'defenses.taunt.mod',
        'system.trickDefenseMod': 'defenses.trick.mod',
        // SK and Threat armor and toughness
        'system.other.armor': 'defenses.armor',
        'system.other.toughness': 'defenses.toughness',
        // Vehicle armor and toughness
        'system.armor': 'defenses.armor',
        'system.toughness': 'defenses.toughness',
        // modify maxDex and minStr
        'system.maxDex': 'system.other.maxDex',
        'system.minStr': 'system.other.minStr',
        'system.attributes.minStr': 'system.other.minStr',
        'system.attributes.maxDex': 'system.other.maxDex',
      };
      for (const change of data.changes) {
        if (Object.hasOwn(migrationDictionary, change.key)) {
          change.key = migrationDictionary[change.key];
        }
      }
      for (const change of data.changes) {
        if (change.key.includes('.isFav') && (change.value === '1' || change.value === '0')) {
          change.value = change.value === '1' ? 'true' : 'false';
        } else if (change.key.includes('.isFav') && (change.value === 'True' || change.value === 'False')) {
          change.value = change.value.toLowerCase();
        }
      }
    }
    return super.migrateData(data);
  }

  /**
   * Our own version, since this.origin might not point to the correct thing.
   */
  get sourceName() {
    if (!this.parent || this.parent instanceof Actor) return game.i18n.localize("None");
    return this.parent.name;
  }
}
