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
      for (const change of data.changes) {
        // fix up effects that had an action related key
        //change.key = change.key.replaceAll('system.other.moveMod', 'system.other.move');
        //change.key = change.key.replaceAll('system.other.runMod', 'system.other.run');
        change.key = change.key.replaceAll('system.other.fatigue', 'system.fatigue');
      }
    }
    return data;
  }
}
