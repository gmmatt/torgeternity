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
    super.migrateData(data);
    if (Object.hasOwn(data, 'changes')) {
      const badAttributeKeys = [
        'system.attributes.charisma',
        'system.attributes.mind',
        'system.attributes.strength',
        'system.attributes.dexterity',
        'system.attributes.spirit',
      ];
      for (const change of data.changes) {
        change.key = change.key.replaceAll('system.other.fatigue', 'system.fatigue');
        if (badAttributeKeys.includes(change.key)) {
          change.key = change.key + '.value';
        }
      }
    }
    return data;
  }
}
