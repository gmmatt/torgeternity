/**
 *
 */
export default class TorgCombat extends Combat {
  /**
   *
   */
  async nextRound() {
    if (game.user.isActiveGM) {
      const settings = game.settings.get('torgeternity', 'deckSetting');
      const dramaDeck = game.cards.get(settings.dramaDeck);
      const dramaDiscard = game.cards.get(settings.dramaDiscard);
      const dramaActive = game.cards.get(settings.dramaActive);
      for (const combatant of this.combatants) {
        await combatant.setFlag('world', 'turnTaken', false);
      }

      if (dramaActive.cards.size > 0) {
        await dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);
      }
      if (dramaDeck.availableCards.length > 0) {
        await dramaActive.draw(dramaDeck, 1, game.torgeternity.cardChatOptions);
      } else {
        ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'));
      }

      this.updateEmbeddedDocuments(
        'Combatant',
        this.combatants.map((combatant) => ({ _id: combatant.id, 'flags.world.turnTaken': false })),
        { updateAll: true }
      );

      // deactivate active defense when the combat round is progressed. End of combat is in the hook above, 'deleteCombat'
      await this.#deleteActiveDefense();
    }
    return super.nextRound();
  }

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
      const settings = game.settings.get('torgeternity', 'deckSetting');
      const dramaDiscard = game.cards.get(settings.dramaDiscard);
      const dramaActive = game.cards.get(settings.dramaActive);
      if (dramaActive.cards.size > 0) {
        dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);
      }
    }
    super._onDelete(options, userId);
  }

  /**
   *
   */
  async nextRoundKeep() {
    for (const combatant of this.combatants) {
      await combatant.setFlag('world', 'turnTaken', false);
    }
    await super.nextRound();
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
   * @param {*} combatants Passed explicitly, for when called from onDelete
   */
  async #deleteActiveDefense() {
    for (const combatant of this.combatants) {
      const activeDefenseEffect = combatant.actor.appliedEffects.find((eff) => eff.name === 'ActiveDefense');
      if (activeDefenseEffect) await activeDefenseEffect.delete();
    }
  }
}