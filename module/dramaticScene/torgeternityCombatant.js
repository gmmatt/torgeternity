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
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    this.updateSource({ "flags.world.turnTaken": false });
  }

  get turnTaken() {
    return this.getFlag('world', 'turnTaken');
  }

  async setTurnTaken(value) {
    await this.setFlag('world', 'turnTaken', value);
    if (value) return this.actor.decayEffects();
  }
}
