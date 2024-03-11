/**
 *
 */
export default class TorgCombat extends Combat {
  /**
   *
   */
  async nextRound() {
    if (game.user.isGM) {
      const dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      const dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      const dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      const x = this.getEmbeddedCollection("Combatant");
      const combatantLength = x.contents.length;
      for (let i = 0; i < combatantLength; i++) {
        const c = x.contents[i];

        await c.setFlag("world", "turnTaken", false);
      }

      const activeStack = dramaActive;
      if (activeStack.cards.size > 0) {
        await dramaActive.cards.contents[0].pass(dramaDiscard);
      }
      if (dramaDeck.availableCards.length > 0) {
        dramaActive.draw(dramaDeck);
        await this._onUpdate;
      } else {
        ui.notifications.info(game.i18n.localize("torgeternity.notifications.dramaDeckEmpty"));
      }
    }
    await super.nextRound();
  }

  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    if (game.user.isGM) {
      const dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      const dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      if (dramaDeck.availableCards.length > 0) {
        dramaActive.draw(dramaDeck);
      } else {
        ui.notifications.info(game.i18n.localize("torgeternity.notifications.dramaDeckEmpty"));
      }
    }

    super._onCreate(data, options, userId);
  }

  /**
   *
   * @param options
   * @param userId
   */
  _onDelete(options, userId) {
    if (game.user.isGM) {
      const dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      const dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      const activeStack = dramaActive;

      if (activeStack.cards.size > 0) {
        dramaActive.cards.contents[0].pass(dramaDiscard);
      }
    }
    super._onDelete(options, userId);
  }

  /**
   *
   */
  async nextRoundKeep() {
    const x = this.getEmbeddedCollection("Combatant");
    const combatantLength = x.contents.length;
    for (let i = 0; i < combatantLength; i++) {
      const c = x.contents[i];

      await c.setFlag("world", "turnTaken", false);
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
      const dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      const activeStack = dramaActive;
      if (activeStack.cards.size > 0) {
        const activeCard = activeStack.cards.contents[0];
        const activeImage = activeCard.faces[0].img;
        this.setFlag("torgeternity", "activeCard", activeImage);
        // document.getElementById("active-drama-card").src = activeImage;
      } else {
        this.setFlag("torgeternity", "activeCard", "");
      }
    }
  }
}
