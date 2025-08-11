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
    if (game.user.isActiveGM) {
      this.setFlag('world', 'turnTaken', false);
    }
    await super._onCreate(data, options, user);
  }

  get turnTaken() {
    return this.getFlag('world', 'turnTaken');
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
