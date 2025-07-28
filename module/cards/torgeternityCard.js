/**
 *
 */
export class torgeternityCard extends Card {

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