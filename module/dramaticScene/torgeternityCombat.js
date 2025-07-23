/**
 *
 */
export default class TorgCombat extends Combat {

  #fatiguedFaction = null;

  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    if (game.user.isGM) {
      const settings = game.settings.get('torgeternity', 'deckSetting');
      const dramaDeck = game.cards.get(settings.dramaDeck);
      const dramaActive = game.cards.get(settings.dramaActive);
      if (dramaDeck.availableCards.length > 0) {
        /*await*/ dramaActive.draw(dramaDeck, 1, game.torgeternity.cardChatOptions);
      } else {
        ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'));
      }
    }
    super._onCreate(data, options, userId);
  }

  async _preDelete(options, user) {
    if (!super._preDelete(options, user)) return false;
    // listing of hands' actors in closing combat
    this.combatants.filter(combatant => combatant.actor.type === 'stormknight')
      .forEach(combatant => {
        const hand = game.actors.get(combatant.actorId).getDefaultHand();
        // delete the flag that give the pooled condition in each card of each hand
        if (hand) hand.cards.forEach(card => card.unsetFlag('torgeternity', 'pooled'))
      });

    this.#deleteActiveDefense();
    return true;
  }

  /**
   *
   * @param options
   * @param userId
   */
  _onDelete(options, userId) {
    if (game.user.isActiveGM) {
      this.setCardsPlayable(true);
      const settings = game.settings.get('torgeternity', 'deckSetting');
      const dramaDiscard = game.cards.get(settings.dramaDiscard);
      const dramaActive = game.cards.get(settings.dramaActive);
      // Discard the current Drama Card
      if (dramaActive.cards.size > 0) {
        dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);
      }
    }
    super._onDelete(options, userId);
  }

  /**
   *
   * @param changed
   * @param options
   * @param userId
   */
  _onUpdate(changed, options, userId) {
    if (game.user.isGM) {
      const dramaActive = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaActive);
      this.setFlag('torgeternity', 'activeCard',
        (dramaActive.cards.size > 0) ? dramaActive.cards.contents[0].faces[0].img : '');
    }
    super._onUpdate(changed, options, userId);
  }

  /**
   *
   */
  async nextRound() {
    if (!game.user.isActiveGM) return super.nextRound();

    const settings = game.settings.get('torgeternity', 'deckSetting');
    const dramaDeck = game.cards.get(settings.dramaDeck);
    const dramaDiscard = game.cards.get(settings.dramaDiscard);
    const dramaActive = game.cards.get(settings.dramaActive);

    // Discard the current Drama Card
    if (dramaActive.cards.size > 0)
      await dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);

    // Draw the next available Drama Card (if any)
    if (dramaDeck.availableCards.length > 0)
      await dramaActive.draw(dramaDeck, 1, game.torgeternity.cardChatOptions);
    else
      ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'));

    // Perform end-of-faction's turn processing
    await this.nextRoundKeep();

    // deactivate active defense when the combat round is progressed. End of combat is in the hook above, 'deleteCombat'
    await this.#deleteActiveDefense();
  }

  /**
   *
   */
  async nextRoundKeep() {
    await this.updateEmbeddedDocuments('Combatant',
      this.combatants.map((combatant) => ({ _id: combatant.id, 'flags.world.turnTaken': false })),
      { updateAll: true });
    this.setCardsPlayable(true);
    this.#fatiguedFaction = null;
    await super.nextRound();
  }

  /**
   * 
   * @param {*} combatants Passed explicitly, for when called from onDelete
   */
  async #deleteActiveDefense() {
    for (const combatant of this.combatants) {
      const activeDefenseEffect = combatant.actor.appliedEffects.find((eff) => eff.name === 'ActiveDefense');
      if (activeDefenseEffect) await activeDefenseEffect.delete();
    }
  }


  /*
   * DRAMA DECK HANDLING
   */
  getCombatantFaction(combatant) {
    return (combatant.token.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) ? 'heroes' : 'villains';
  }
  getFactionActors(faction) {
    const disposition = (faction === 'heroes') ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.HOSTILE;
    return this.turns.filter(combatant => combatant.token.disposition === disposition).map(combatant => combatant.actor);
  }
  setCardsPlayable(value) {
    for (const actor of this.getFactionActors('heroes')) {
      const hand = actor.getDefaultHand();
      // use 'disablePlayCards' so that when the flag is undefined, cards can be played
      if (hand) hand.setFlag('torgeternity', 'disablePlayCards', !value)
    }
  }

  async dramaFlurry(faction) {
    // extra turn
    console.log('Drama Flurry', faction)
  }

  async dramaInspiration(faction) {
    console.log('Drama Inspiration', faction)

    // immediately recover 2 shock (see macros.js:reviveShock)
    let chatOutput = `<h2>${game.i18n.localize(
      'torgeternity.macros.reviveMacroChatHeadline'
    )}</h2><p>${game.i18n.localize('torgeternity.macros.reviveMacroFirst')}<p><ul>`;

    for (const actor of this.getFactionActors(faction)) {
      const shock = actor.system.shock.value;
      if (shock === 0) continue;
      const reviveAmount = Math.min(shock, 2);
      await actor.update({ 'system.shock.value': shock - reviveAmount });
      chatOutput += `<li>${actor.name} ${game.i18n.localize('torgeternity.macros.reviveMacroCharPartyRevived')}${reviveAmount}`;
      if (actor.hasStatusEffect('unconscious')) {
        actor.toggleStatusEffect('unconscious', { active: false });
        chatOutput += `<br>${game.i18n.localize('torgeternity.macros.reviveMacroCharDeKOed')} ${actor.name}`;
      }
      chatOutput += '</ul>';
    }
    ChatMessage.create({ content: chatOutput });
  }

  async dramaUp(faction) {
    // UP on first roll for each actor
    console.log('Drama Up', faction)
  }

  async dramaConfused(faction) {
    // unable to play Cards from their pool
    console.log('Drama Confused', faction)
    this.setCardsPlayable(false);
  }

  async dramaFatigued(faction) {
    // At the end of an Actor's turn, they take 2 points of shock
    console.log('Drama Fatigued', faction)
    this.#fatiguedFaction = faction;
  }

  async dramaSetback(faction) {
    // GM decides a likely setback
    console.log('Drama Setback', faction)
  }

  async dramaStymied(faction) {
    // All Actors become Stymied until the end of their next turn
    console.log('Drama Stymied', faction)
    for (const actor of this.getFactionActors(faction))
      actor.applyStymiedState(this);
  }

  async dramaSurge(faction) {
    // All Actors must check for Contradictions
    console.log('Drama Surge', faction)
  }

  /**
   * General end-of-character turn processing
   */
  dramaEndOfTurn(combatant) {
    if (this.#fatiguedFaction === this.getCombatantFaction(combatant)) {
      const actor = combatant.actor;

      let chatOutput = `<h2>${game.i18n.localize(
        'torgeternity.sheetLabels.fatigue'
      )}!</h2><p>${game.i18n.localize('torgeternity.macros.fatigueMacroDealtDamage')}</p><ul>`;

      if (actor.hasStatusEffect('unconscious')) {
        chatOutput += `<li>${combatant.actor.name} ${game.i18n.localize('torgeternity.macros.fatigueMacroCharAlreadyKO')}</li>`;
      }

      const shockIncrease = actor.fatigue;
      const applyResult = actor.applyDamages(/*shock*/ shockIncrease, /*wounds*/ 0);

      chatOutput += `<li>${actor.name}: ${shockIncrease} ${game.i18n.localize('torgeternity.sheetLabels.shock')}`;
      if (applyResult.shockExceeded) {
        chatOutput += `<br><strong>${actor.name}${game.i18n.localize('torgeternity.macros.fatigueMacroCharKO')}</strong>`;
      }
      chatOutput += '</li>';

      chatOutput += '</ul>';
      ChatMessage.create({ content: chatOutput });
    }
  }
}