import TorgCombatant from './torgeternityCombatant.js';
/**
 *
 */

export default class torgeternityCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {

  static PARTS = {
    header: { template: "systems/torgeternity/templates/sidebar/combat-tracker-header.hbs" },
    tracker: { template: 'systems/torgeternity/templates/sidebar/combat-tracker.hbs' },
    footer: { template: "systems/torgeternity/templates/sidebar/combat-tracker-footer.hbs" }
  }

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity'],  // setting DARK theme doesn't work on CombatTracker
    actions: {
      'heroesFirst': torgeternityCombatTracker.#onHeroesFirst,
      'villainsFirst': torgeternityCombatTracker.#onVillainsFirst,
      'hasPlayed': torgeternityCombatTracker.#onToggleTurn,
      'dsrCounter': torgeternityCombatTracker.#incStage,
      'playerDsrCounter': torgeternityCombatTracker.#incPlayerStage,
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.hasTurn = this.viewed?.combatants?.some(combatant => !combatant.turnTaken && combatant.isOwner && !!context.round);
    return context;
  }

  /**
   *
   * @param event
   */
  static async #onToggleTurn(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    const turnTaken = combatant.getFlag('world', 'turnTaken');
    await combatant.setFlag('world', 'turnTaken', !turnTaken);
  }

  /**
 *
 */
  static async #onVillainsFirst() {
    if (!this.viewed) return;
    await this.viewed.resetAll();
    const updates = [];
    for (const combatant of this.viewed.turns) {
      const initiative = (combatant.token.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) ? 1 : 2;
      updates.push({ _id: combatant.id, initiative });
    }
    if (updates.length) this.viewed.updateEmbeddedDocuments("Combatant", updates, { turnEvents: false });
  }

  /**
   *
   */
  static async #onHeroesFirst() {
    if (!this.viewed) return;
    await this.viewed.resetAll();
    const updates = [];
    for (const combatant of this.viewed.turns) {
      const initiative = (combatant.token.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) ? 2 : 1;
      updates.push({ _id: combatant.id, initiative });
    }
    if (updates.length) this.viewed.updateEmbeddedDocuments("Combatant", updates, { turnEvents: false });
  }

  updateStage(document) {
    let newStep;
    switch (document.getFlag('torgeternity', 'dsrStage')) {
      case undefined:
      case '': newStep = 'A'; break;
      case 'A': newStep = 'B'; break;
      case 'B': newStep = 'C'; break;
      case 'C': newStep = 'D'; break;
      case 'D': newStep = ''; break;
    }
    document.setFlag('torgeternity', 'dsrStage', newStep);
  }

  /**
   *
   * @param event
   */
  static async #incStage(event, button) {
    if (!this.viewed) return;
    event.preventDefault();
    this.updateStage(this.viewed);
  }

  /**
   *
   * @param event
   */
  static async #incPlayerStage(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;
    this.updateStage(combatant);
    event.preventDefault();
  }

  finishTurn() {
    const combatant = this.viewed?.combatants.find(combatant.turnTaken && combatant.isOwner);
    combatant.setFlag('world', 'turnTaken', true);
  }
}
