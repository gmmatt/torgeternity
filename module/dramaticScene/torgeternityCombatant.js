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
    return this.setFlag('world', 'turnTaken', value);
  }

  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);

    if (!game.user.isActiveGM || !changed.flags?.world?.turnTaken) return;

    const actor = this.actor;
    const toUpdate = [];
    const toDelete = [];
    for (const effect of actor.effects.filter((e) => e.duration.type === 'turns')) {
      if (effect.name === 'ActiveDefense') continue;
      if (effect.duration.turns === 1 && effect.duration.rounds === 1)
        toDelete.push(effect.id)
      else
        toUpdate.push({
          _id: effect.id,
          'duration.turns': effect.duration.turns - 1,
          'duration.rounds': effect.duration.rounds - 1,
        });
    }
    if (toUpdate.length) actor.updateEmbeddedDocuments('ActiveEffect', toUpdate);
    if (toDelete.length) actor.deleteEmbeddedDocuments('ActiveEffect', toDelete);
  }
}
