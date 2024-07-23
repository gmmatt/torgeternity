/**
 *
 */
export default class torgeternityCombatTracker extends CombatTracker {
  /**
   *
   */
  get template() {
    return 'systems/torgeternity/templates/sidebar/combat-tracker.html';
  }

  /**
   *
   * @param html
   */
  async activateListeners(html) {
    super.activateListeners(html);
    html.find('input.combatant-init').change(this._onUpdateInit.bind(this));
    html.find('a.init-up').click(this._onInitUp.bind(this));
    html.find('a.init-down').click(this._onInitDown.bind(this));
    html.find('a.heros-first').click(this._sortHeroesFirst.bind(this));
    html.find('a.vilains-first').click(this._sortVilainsFirst.bind(this));
    html.find('a.has-played').click(this._hasPlayed.bind(this));
    html.find('a.dsr-counter').click(this._dsrCounter.bind(this));
    html.find('a.player-dsr-counter').click(this._playerDsrCounter.bind(this));
    html.find('a.combat-finish.center').click(this._hasFinished.bind(this));
    // html.find(".fa-check-circle").click(this._toggleCheck.bind(this));
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
    const tooltipSpanImage = ev.target.children[0];
    const rect = tooltipSpanImage.getBoundingClientRect();

    if (rect.left < 246) {
      tooltipSpanImage.style.left = 'auto';
      tooltipSpanImage.style.right = '-250px';
    } else {
      tooltipSpanImage.style.left = '-250px';
      tooltipSpanImage.style.right = '30px';
    }
  }

  /**
   *
   * @param ev
   */
  _toggleCheck(ev) {
    ev.currentTarget.classList.toggle('fas');
    ev.currentTarget.classList.toggle('far');
    ev.currentTarget.classList.toggle('playedOK');
  }

  /**
   *
   * @param ev
   */
  async _hasFinished(ev) {
    this.viewed.combatants
      .find((c) => c.actorId === game.user.character.id)
      .setFlag('world', 'turnTaken', true);
  }

  /**
   *
   * @param ev
   */
  async _hasPlayed(ev) {
    const check = ev.currentTarget;
    // check.toggleClass('fa-check-square fa-minus-circle')

    const li = check.closest('.combatant');
    const c = this.viewed.combatants.get(li.dataset.combatantId);
    if (c.flags.world.turnTaken === false) {
      await c.setFlag('world', 'turnTaken', true);
    } else {
      await c.setFlag('world', 'turnTaken', false);
    }
  }
  /**
   *
   * @param ev
   */
  async _onUpdateInit(ev) {
    const input = ev.currentTarget;
    const li = input.closest('.combatant');
    const c = this.viewed.combatants.get(li.dataset.combatantId);
    await this.viewed.combatant.update({
      _id: c._id,
      ['initiative']: input.value,
    });

    this.render();
  }

  /**
   *
   * @param ev
   */
  async _onInitUp(ev) {
    const btn = ev.currentTarget;
    const li = btn.closest('.combatant');
    const c = this.viewed.combatants.get(li.dataset.combatantId); // hope this works!
    await this.viewed.combatant.update({
      _id: c.id,
      ['initiative']: c.initiative + 1,
    });
    this.render();
  }
  /**
   *
   * @param ev
   */
  async _onInitDown(ev) {
    const btn = ev.currentTarget;
    const li = btn.closest('li.combatant');
    const c = this.viewed.combatants.get(li.dataset.combatantId); // hope this works!
    await this.viewed.combatant.update({
      _id: c.id,
      ['initiative']: c.initiative - 1,
    });
    this.render();
  }

  /**
   *
   */
  async _sortVilainsFirst() {
    await this.viewed.resetAll();
    let combatantArray = null;
    let i = 0;
    for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
      if (this.viewed.turns[i].token.disposition < 1) {
        // token disposition is neutral or hostile (0 or -1)
        await this.viewed.turns[i].update({
          initiative: 2,
        });
      } else {
        // token disposition is frinedly 1
        await this.viewed.turns[i].update({
          initiative: 1,
        });
      }
    }
    this.render();
  }

  /**
   *
   */
  async _sortHeroesFirst() {
    await this.viewed.resetAll();
    let combatantArray = null;
    let i = 0;
    for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
      if (this.viewed.turns[i].token.disposition < 1) {
        // token disposition is neutral or hostile (0 or -1)
        await this.viewed.turns[i].update({
          initiative: 1,
        });
      } else {
        // token disposition is frinedly 1
        await this.viewed.turns[i].update({
          initiative: 2,
        });
      }
    }
    // await this.viewed.setupTurns()
    this.render();
  }

  /**
   *
   * @param ev
   */
  async _dsrCounter(ev) {
    const currentStep = this.viewed.getFlag('torgeternity', 'dsrStage');

    switch (currentStep) {
      case undefined:
        this.viewed.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case '':
        this.viewed.setFlag('torgeternity', 'dsrStage', 'A');
        break;
      case 'A':
        this.viewed.setFlag('torgeternity', 'dsrStage', 'B');
        break;
      case 'B':
        this.viewed.setFlag('torgeternity', 'dsrStage', 'C');
        break;
      case 'C':
        this.viewed.setFlag('torgeternity', 'dsrStage', 'D');
        break;
      case 'D':
        this.viewed.setFlag('torgeternity', 'dsrStage', '');
        break;
    }
  }

  /**
   *
   * @param ev
   */
  async _playerDsrCounter(ev) {
    const btn = ev.currentTarget;
    const li = btn.closest('li.combatant');
    const c = this.viewed.combatants.get(li.dataset.combatantId);

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
}
