export default class torgCombatant extends Combatant {
  async _onCreate(data, options, user) {
    if (game.user.isGM) {
      this.setFlag("world", "turnTaken", false);
    }

    await super._onCreate(data, options, user);
  }
}
