import TorgCombatant from './torgeternityCombatant.js';
/**
 *
 */

export default class torgeternityCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {

  firstFaction = 'heroes';
  secondFaction = 'villains';

  static PARTS = {
    header: { template: "systems/torgeternity/templates/sidebar/combat-tracker-header.hbs" },
    tracker: { template: 'systems/torgeternity/templates/sidebar/combat-tracker.hbs' },
    footer: { template: "systems/torgeternity/templates/sidebar/combat-tracker-footer.hbs" }
  }

  static DEFAULT_OPTIONS = {
    // token-effects ignore the themed setting below.
    classes: ['torgeternity', 'themed', 'theme-dark'],
    actions: {
      'toggleDramatic': torgeternityCombatTracker.#toggleDramatic,
      'heroesFirst': torgeternityCombatTracker.#onHeroesFirst,
      'villainsFirst': torgeternityCombatTracker.#onVillainsFirst,
      'hasPlayed': torgeternityCombatTracker.#onHasPlayed,
      'dsrCounter': torgeternityCombatTracker.#incStage,
      'playerDsrCounter': torgeternityCombatTracker.#incPlayerStage,
      'hasFinished': torgeternityCombatTracker.#onHasFinished,
      "dramaFlurry": torgeternityCombatTracker.#onDramaFlurry,
      "dramaInspiration": torgeternityCombatTracker.#onDramaInspiration,
      "dramaUp": torgeternityCombatTracker.#onDramaUp,
      "dramaConfused": torgeternityCombatTracker.#onDramaConfused,
      "dramaFatigued": torgeternityCombatTracker.#onDramaFatigued,
      "dramaSetback": torgeternityCombatTracker.#onDramaSetback,
      "dramaStymied": torgeternityCombatTracker.#onDramaStymied,
      "dramaSurge": torgeternityCombatTracker.#onDramaSurge,
    }
  }

  async _prepareCombatContext(context, options) {
    // for HEADER and FOOTER
    await super._prepareCombatContext(context, options);
    const combat = this.viewed;
    const heroesFirst = combat?.areHeroesFirst;
    context.firstFaction = heroesFirst ? 'heroes' : 'villains';
    context.secondFaction = !heroesFirst ? 'heroes' : 'villains';
    context.isDramatic = combat?.isDramatic;
    context.conflictLine = combat?.conflictLineText;
    context.approvedActions = combat?.approvedActionsText;
    context.dsrLine = combat?.dsrText;

    context.approved = {};
    if (combat)
      for (const action of combat.approvedActions)
        context.approved[action] = true;
    context.firstCondition = !combat ? 'none' : heroesFirst ? combat.heroCondition : combat.villainCondition;
    context.secondCondition = !combat ? 'none' : !heroesFirst ? combat.heroCondition : combat.villainCondition;

    context.hasTurn = context.combat?.combatants?.some(combatant =>
      !combatant.turnTaken && combatant.isOwner && context.combat.round);
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
   * Add an option to Shuffle the Drama Deck
   */
  _getCombatContextOptions() {
    const options = super._getCombatContextOptions();
    options.unshift({
      name: "torgeternity.dramaCard.shuffleDeck",
      icon: '<i class="fa-solid fa-random"></i>',
      condition: game.user.isGM && !!this.viewed,
      callback: () => this.viewed.resetDramaDeck()
    })
    return options;
  }
  /**
   * A player has pressed the button at the bottom of the combat tracker to end "their" turn.
   * @param event
   */
  static async #onHasFinished(event, button) {
    const combatant = this.viewed?.combatants.find(combatant => combatant.actorId === game.user.character.id);
    if (!combatant) return;

    await combatant.setFlag('world', 'turnTaken', true);
    this.viewed.dramaEndOfTurn(combatant);
  }

  /**
   * A player has finished their turn.
   * @param event
   */
  static async #onHasPlayed(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    const turnTaken = !combatant.getFlag('world', 'turnTaken');
    await combatant.setFlag('world', 'turnTaken', turnTaken);
    if (turnTaken) this.viewed.dramaEndOfTurn(combatant);
  }

  /**
 *
 */
  static async #onVillainsFirst() {
    if (!this.viewed) return;
    this.firstFaction = 'villains';
    this.secondFaction = 'heroes';
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
    this.firstFaction = 'heroes';
    this.secondFaction = 'villains';
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
    // Check for Fatigued on Drama Conflict Line (see macros.js)
    combatant.setFlag('world', 'turnTaken', true);
  }

  /*
   * DRAMA DECK HANDLING
   */
  static #toggleDramatic(event, button) {
    const newstate = !this.viewed.isDramatic;
    this.viewed.setIsDramatic(newstate);
    console.log(`COMBAT MODE = ${newstate ? "DRAMATIC" : "STANDARD"} ==> ${this.viewed.conflictLineText}`)
  }
  static #onDramaFlurry(event, button) {
    this.viewed.dramaFlurry(button.dataset.faction);
  }
  static async #onDramaInspiration(event, button) {
    this.viewed.dramaInspiration(button.dataset.faction);
  }
  static #onDramaUp(event, button) {
    this.viewed.dramaUp(button.dataset.faction)
  }
  static #onDramaConfused(event, button) {
    this.viewed.dramaConfused(button.dataset.faction)
  }
  static #onDramaFatigued(event, button) {
    this.viewed.dramaFatigued(button.dataset.faction)
  }
  static #onDramaSetback(event, button) {
    this.viewed.dramaSetback(button.dataset.faction)
  }
  static #onDramaStymied(event, button) {
    this.viewed.dramaStymied(button.dataset.faction)
  }
  static #onDramaSurge(event, button) {
    this.viewed.dramaSurge(button.dataset.faction)
  }
}
