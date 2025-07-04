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
      'hasFinished': torgeternityCombatTracker.#onHasFinished
    }
  }

  async _prepareCombatContext(context, options) {
    await super._prepareCombatContext(context, options);
    context.hasTurn = context.combat?.combatants?.some(combatant => !combatant.turnTaken && combatant.isOwner && !!context.combat.round);
  }

  async _prepareTurnContext(combat, combatant, index) {
    const context = await super._prepareTurnContext(combat, combatant, index);

    const hand = combatant.actor.getDefaultHand();
    context.noHand = !hand;
    if (hand) {
      context.cardpool = hand.cards
        ?.filter(card => card.flags?.torgeternity?.pooled)
        .map(card => { return { name: card.name, img: card.img } }) ?? [];
    }
    context.turnTaken = combatant.turnTaken;
    context.actorType = combatant.actor.type;
    const dispositions = {
      [CONST.TOKEN_DISPOSITIONS.SECRET]: "secret",
      [CONST.TOKEN_DISPOSITIONS.HOSTILE]: "hostile",
      [CONST.TOKEN_DISPOSITIONS.NEUTRAL]: "neutral",
      [CONST.TOKEN_DISPOSITIONS.FRIENDLY]: "friendly",
    }
    context.dsrStage = combatant.flags?.torgeternity?.dsrStage;

    // Remove "active" class from combatants since we don't use it, 
    // and Foundry's core CSS causes it to mess up the card hover function.
    const css = context.css.split(" ").filter(cls => cls !== 'active');
    css.push(dispositions[combatant.token.disposition]);
    if (combatant.turnTaken) css.push(' turnDone');
    context.css = css.join(" ");
    return context;
  }

  /**
   *
   * @param event
   */
  static async #onHasFinished(event, button) {
    await this.viewed?.combatants
      .find(combatant => combatant.actorId === game.user.character.id)
      .setFlag('world', 'turnTaken', true);
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
