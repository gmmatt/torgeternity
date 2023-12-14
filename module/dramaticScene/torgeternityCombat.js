export default class TorgCombat extends Combat {
  async nextRound() {
    if (game.user.isGM) {
      let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      let x = this.getEmbeddedCollection("Combatant");
      let combatantLength = x.contents.length;
      for (let i = 0; i < combatantLength; i++) {
        let c = x.contents[i];

        await c.setFlag("world", "turnTaken", false);
        let y = 0;
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

  _onCreate(data, options, userId) {
    if (game.user.isGM) {
      let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      if (dramaDeck.availableCards.length > 0) {
        dramaActive.draw(dramaDeck);
      } else {
        ui.notifications.info(game.i18n.localize("torgeternity.notifications.dramaDeckEmpty"));
      }
    }

    super._onCreate(data, options, userId);
  }

  _onDelete(options, userId) {
    if (game.user.isGM) {
      let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      const activeStack = dramaActive;

      if (activeStack.cards.size > 0) {
        dramaActive.cards.contents[0].pass(dramaDiscard);
      }
    }
    super._onDelete(options, userId);
  }

  async nextRoundKeep() {
    let x = this.getEmbeddedCollection("Combatant");
    let combatantLength = x.contents.length;
    for (let i = 0; i < combatantLength; i++) {
      let c = x.contents[i];

      await c.setFlag("world", "turnTaken", false);
      let y = 0;
    }

    await super.nextRound();
  }

  _onUpdate(changed, options, userId) {
    if (game.user.isGM) {
      let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
      let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
      let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
      const activeStack = dramaActive;
      if (activeStack.cards.size > 0) {
        const activeCard = activeStack.cards.contents[0];
        const activeImage = activeCard.faces[0].img;
        this.setFlag("torgeternity", "activeCard", activeImage);
        //document.getElementById("active-drama-card").src = activeImage;
        let x = 0;
      } else {
        this.setFlag("torgeternity", "activeCard", "");
      }
    }
  }
}
