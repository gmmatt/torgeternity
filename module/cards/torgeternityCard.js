/**
 *
 */
export class torgeternityCard extends Card {

  /**
   * If a card's pooled state is changed, then update the Combat Tracker to show the new set of pooled cards.
   * @param {*} changed 
   * @param {*} options 
   * @param {*} userId 
   */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (changed.system?.pooled !== undefined && ui.combat)
      ui.combat.render({ parts: ["tracker"] });
  }

  static migrateData(source) {
    if (source.flags?.torgeternity?.pooled !== undefined) {
      source.system.pooled = source.flags.torgeternity.pooled;
      delete source.flags.torgeternity.pooled;
    }
    return super.migrateData(source);
  }
}