export default class torgCombatant extends Combatant {

  async _onUpdate() {

    this.setFlag("world", "turnTaken", false);

    await super._preCreate(data, options, user);
  }


}