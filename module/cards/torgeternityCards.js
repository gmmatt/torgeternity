/**
 *
 */
export class torgeternityCards extends Cards {
  async _onDelete(options, userId) {
    // Remove this hand from the list of hands which will update the Combat Tracker
    // (which were registered in the 'renderCombatTracker' hook in torgeternity.js)
    delete this.apps[config.ui.combat];
    super._onDelete(options, userId);
  }
}
