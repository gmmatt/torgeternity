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
    actions: {
      'init-up': torgeternityCombatTracker._onInitUp,
      'init-down': torgeternityCombatTracker._onInitDown,
      'heros-first': torgeternityCombatTracker._sortHeroesFirst,
      'vilains-first': torgeternityCombatTracker._sortVilainsFirst,
      'has-played': torgeternityCombatTracker._hasPlayed,
      'dsr-counter': torgeternityCombatTracker._dsrCounter,
      'player-dsr-counter': torgeternityCombatTracker._playerDsrCounter,
      'combat-finish.center': torgeternityCombatTracker._hasFinished,
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
    const html = this.element;
    super._onRender(html);
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
   * @param {object} ev The event
   */
  async _notOutOfBounds(ev) {
    const tooltipImage = ev.target.children[0];
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
   * @param ev
   */
  static _toggleCheck(ev) {
    ev.srcElement.classList.toggle('fas');
    ev.srcElement.classList.toggle('far');
    ev.srcElement.classList.toggle('playedOK');
  }

  /**
   *
   * @param ev
   */
  static async _hasFinished(ev) {
    await this.viewed?.combatants
      .find((c) => c.actorId === game.user.character.id)
      .setFlag('world', 'turnTaken', true);
  }

  /**
   *
   * @param ev
   */
  static async _hasPlayed(ev) {
    const combatantId = ev.srcElement.closest('[data-combatant-id]').dataset.combatantId;
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant.isOwner) return;
    const turnTaken = combatant.getFlag('world', 'turnTaken');
    await combatant.setFlag('world', 'turnTaken', !turnTaken);
  }

  /**
   *
   * @param ev
   */
  async _onUpdateInit(ev) {
    const input = ev.srcElement;
    const li = input.closest('.combatant');
    const c = this.viewed?.combatants.get(li.dataset.combatantId);
    await this.viewed?.combatant.update({
      _id: c._id,
      ['initiative']: input.value,
    });

    this.render();
  }

  /**
   *
   * @param ev
   */
  static async _onInitUp(ev) {
    const btn = ev.srcElement;
    const li = btn.closest('.combatant');
    const c = this.viewed?.combatants.get(li.dataset.combatantId); // hope this works!
    await this.viewed?.combatant.update({
      _id: c.id,
      ['initiative']: c.initiative + 1,
    });
    this.render();
  }
  /**
   *
   * @param ev
   */
  static async _onInitDown(ev) {
    const btn = ev.srcElement;
    const li = btn.closest('li.combatant');
    const c = this.viewed?.combatants.get(li.dataset.combatantId); // hope this works!
    await this.viewed?.combatant.update({
      _id: c.id,
      ['initiative']: c.initiative - 1,
    });
    this.render();
  }

  /**
   *
   */
  static async _sortVilainsFirst() {
    await this.viewed?.resetAll();
    let combatantArray = null;
    let i = 0;
    for (combatantArray = this.viewed?.turns; i < combatantArray.length; i++) {
      if (this.viewed?.turns[i].token.disposition < 1) {
        // token disposition is neutral or hostile (0 or -1)
        await this.viewed?.turns[i].update({
          initiative: 2,
        });
      } else {
        // token disposition is frinedly 1
        await this.viewed?.turns[i].update({
          initiative: 1,
        });
      }
    }
    this.render();
  }

  /**
   *
   */
  static async _sortHeroesFirst() {
    await this.viewed?.resetAll();
    let combatantArray = null;
    let i = 0;
    for (combatantArray = this.viewed?.turns; i < combatantArray.length; i++) {
      if (this.viewed?.turns[i].token.disposition < 1) {
        // token disposition is neutral or hostile (0 or -1)
        await this.viewed?.turns[i].update({
          initiative: 1,
        });
      } else {
        // token disposition is frinedly 1
        await this.viewed?.turns[i].update({
          initiative: 2,
        });
      }
    }
    // await this.viewed?.setupTurns()
    this.render();
  }

  /**
   *
   * @param ev
   */
  static async _dsrCounter(ev) {
    const currentStep = this.viewed?.getFlag('torgeternity', 'dsrStage');

    switch (currentStep) {
      case undefined:
        this.viewed?.setFlag('torgeternity', 'dsrStage', 'A');
        break;
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
   * @param ev
   */
  static async _playerDsrCounter(ev) {
    const btn = ev.srcElement;
    const li = btn.closest('li.combatant');
    const c = this.viewed?.combatants.get(li.dataset.combatantId);

    const currentStep = c.getFlag('torgeternity', 'dsrStage');

    switch (currentStep) {
      case undefined:
        c.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case '':
        c.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case 'A':
        c.setFlag('torgeternity', 'dsrStage', 'B');
        break;
      case 'B':
        c.setFlag('torgeternity', 'dsrStage', 'C');
        break;
      case 'C':
        c.setFlag('torgeternity', 'dsrStage', 'D');
        break;
      case 'D':
        c.setFlag('torgeternity', 'dsrStage', '');
        break;
    }
  }

  finishTurn() {
    const combatant = this.viewed?.combatants.find(combatant.turnTaken && combatant.isOwner);
    combatant.setFlag('world', 'turnTaken', true);
  }
}
