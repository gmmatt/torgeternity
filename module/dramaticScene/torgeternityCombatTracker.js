import TorgCombatant from './torgeternityCombatant.js';
/**
 *
 */

export default class torgeternityCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /**
   *
   */

  static PARTS = {
    header: {
      template: "systems/torgeternity/templates/sidebar/combat-tracker-header.hbs"
    },
    tracker: {
      template: 'systems/torgeternity/templates/sidebar/combat-tracker.hbs'
    },
    footer: {
      template: "systems/torgeternity/templates/sidebar/combat-tracker-footer.hbs"
    }
  }

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity', 'themed', 'theme-dark'],
    actions: {
      'initUp': torgeternityCombatTracker.#onIncInit,
      'initDown': torgeternityCombatTracker.#onDecInit,
      'heroesFirst': torgeternityCombatTracker.#onHeroesFirst,
      'villainsFirst': torgeternityCombatTracker.#onVillainsFirst,
      'hasPlayed': torgeternityCombatTracker.#onToggleTurn,
      'dsrCounter': torgeternityCombatTracker.#incStage,
      'playerDsrCounter': torgeternityCombatTracker.#incPlayerStage,
      'combat-finish.center': torgeternityCombatTracker.#onTurnTaken,
    }
  }

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    data.hasTurn = this.viewed?.combatants?.some((c) => {
      const returnValue = !c.turnTaken && c.isOwner && !!data.round;
      return returnValue;
    });
    return data;
  }

  /**
   *
   * @param html
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    const html = this.element;
    function set(field, event, func) {
      html.querySelectorAll(field).forEach(e => e.addEventListener(event, func))
    }
    set('input.combatant-init', 'change', this._onUpdateInit.bind(this));

    for (const element of document.querySelectorAll('.pool-tooltip')) {
      await element.addEventListener('mouseenter', this._notOutOfBounds);
    }
  }

  /**
   * Making sure, that mouseover card display isn't out of bounds
   *
   * @param {object} event The event
   */
  async _notOutOfBounds(event) {
    const tooltipImage = event.target.children[0];
    const rect = tooltipImage.getBoundingClientRect();

    if (rect.left < 0) {
      tooltipImage.style.left = 'auto';
      tooltipImage.style.right = '-250px';
    } else if (rect.right > window.innerWidth) {
      tooltipImage.style.left = '-250px';
      tooltipImage.style.right = '30px';
    }
  }

  /**
   *
   * @param event
   */
  static _toggleCheck(event) {
    event.target.classList.toggle('fas');
    event.target.classList.toggle('far');
    event.target.classList.toggle('playedOK');
  }

  /**
   *
   * @param event
   */
  static async #onTurnTaken(event, button) {
    await this.viewed?.combatants
      .find((c) => c.actorId === game.user.character.id)
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
   * @param event
   */
  async _onUpdateInit(event) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    await this.viewed?.combatant.update({ initiative: input.value });
    this.render();
  }

  /**
   *
   * @param event
   */
  static async #onIncInit(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    await this.viewed?.combatant.update({ initiative: combatant.initiative + 1 });
    this.render();
  }
  /**
   *
   * @param event
   */
  static async #onDecInit(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    await this.viewed?.combatant.update({ initiative: combatant.initiative - 1 });
    this.render();
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

  /**
   *
   * @param event
   */
  static async #incStage(event, button) {
    const currentStep = this.viewed?.getFlag('torgeternity', 'dsrStage');

    switch (currentStep) {
      case undefined:
      case '':
        this.viewed?.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case 'A':
        this.viewed?.setFlag('torgeternity', 'dsrStage', 'B');
        break;
      case 'B':
        this.viewed?.setFlag('torgeternity', 'dsrStage', 'C');
        break;
      case 'C':
        this.viewed?.setFlag('torgeternity', 'dsrStage', 'D');
        break;
      case 'D':
        this.viewed?.setFlag('torgeternity', 'dsrStage', '');
        break;
    }
  }

  /**
   *
   * @param event
   */
  static async #incPlayerStage(event, button) {
    const { combatantId } = button.closest("[data-combatant-id]")?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;

    const currentStep = combatant.getFlag('torgeternity', 'dsrStage');

    switch (currentStep) {
      case undefined:
      case '':
        combatant.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case 'A':
        combatant.setFlag('torgeternity', 'dsrStage', 'B');
        break;
      case 'B':
        combatant.setFlag('torgeternity', 'dsrStage', 'C');
        break;
      case 'C':
        combatant.setFlag('torgeternity', 'dsrStage', 'D');
        break;
      case 'D':
        combatant.setFlag('torgeternity', 'dsrStage', '');
        break;
    }
  }

  finishTurn() {
    const combatant = this.viewed?.combatants.find(combatant.turnTaken && combatant.isOwner);
    combatant.setFlag('world', 'turnTaken', true);
  }
}
