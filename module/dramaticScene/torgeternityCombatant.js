/**
 *
 */
export default class TorgCombatant extends Combatant {
  /**
   *
   * @param data
   * @param options
   * @param user
   */
  async _onCreate(data, options, user) {
    if (game.user.isGM) {
      this.setFlag('world', 'turnTaken', false);
    }

    await super._onCreate(data, options, user);
  }

  get turnTaken() {
    return this.getFlag('world', 'turnTaken');
  }
}
