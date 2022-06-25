export default class TorgCombat extends Combat {

    async nextRound() {
        if (game.user.isGM) {
            let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
            let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
            let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
            let x = this.getEmbeddedCollection("Combatant")
            let combatantLength = x.contents.length
            for (let i = 0; i < combatantLength; i++) {
                let c = x.contents[i]

                await c.setFlag("world", "turnTaken", false)
                let y = 0
            }

            const activeStack = dramaActive;
            if (activeStack.data.cards.document.availableCards.length > 0) {
                await dramaActive.data.cards.document.availableCards[0].pass(dramaDiscard);
            }
            if (dramaDeck.availableCards.length > 0) {
                dramaActive.draw(dramaDeck);
                await this._onUpdate;
            } else {
                ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'))
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
                ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'))
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

            if (activeStack.data.cards.document.availableCards.length > 0) {
                dramaActive.data.cards.document.availableCards[0].pass(dramaDiscard);
            }

        }
        super._onDelete(options, userId);

    }


    async nextRoundKeep() {
        let x = this.getEmbeddedCollection("Combatant")
        let combatantLength = x.contents.length
        for (let i = 0; i < combatantLength; i++) {
            let c = x.contents[i]

            await c.setFlag("world", "turnTaken", false)
            let y = 0
        }

        await super.nextRound();

    }

    _onUpdate(changed, options, userId) {

        if (game.user.isGM) {
          let dramaDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDeck);
          let dramaDiscard = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaDiscard);
          let dramaActive = game.cards.get(game.settings.get("torgeternity", "deckSetting").dramaActive);
          const activeStack = dramaActive;
            if (activeStack.data.cards.document.availableCards.length > 0) {
                const activeCard = activeStack.data.cards.document.availableCards[0];
                const activeImage = activeCard.data.faces[0].img;
                this.setFlag("torgeternity", "activeCard", activeImage)
                    //document.getElementById("active-drama-card").src = activeImage;
                let x = 0;
            } else {
                this.setFlag("torgeternity", "activeCard", "")
            }
        }
    }

    /*
    _sortCombatants(a, b) {
      const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
      const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;
      console.log("sorted")
      if (ia > ib) {
        return 1;
      }
      if (ia < ib) {
        return -1;
      }

    } */
    // Not working in 0.8.x, but left here for posterity
    /*
    _prepareCombatant(c, scene, players, settings = {}) {
      let combatant = super._Combatant.create(c, scene, players, (settings = {}));
      combatant.data.flags.type = c.actor.data.type;
      if (c.players.length > 0) {
        combatant.data.flags.color = c.players[0].color;
      }
      return combatant;
    };
    
  _onUpdateEmbeddedDocuments(embeddedName, documents, result, options, userId) {
    let a = this;
  }

  /* async nextTurn() {
    let turn = this.current.turn;
    let nextPlayed = this.turns[turn + 1]?.hasPlayed;
    console.log(this)

    let skip = this.settings.skipDefeated || nextPlayed;

    // Determine the next turn number
    let next = null;
    if (skip) {
      for (let [i, t] of this.turns.entries()) {
        if (i <= turn) continue;
        if (t.defeated) continue;
        if (t.hasPlayed) continue;
        if (t.actor?.effects.find(e => e.getFlag("core", "statusId") === CONFIG.Combat.defeatedStatusId)) continue;
        next = i;
        break;
      }
    }
    else next = turn + 1;

    // Maybe advance to the next round
    let round = this.round;
    if ((this.round === 0) || (next === null) || (next >= this.turns.length)) {
      return this.nextRound();
    }

    // Update the encounter
    const advanceTime = CONFIG.time.turnTime;
    this.update({ round: round, turn: next }, { advanceTime });
  }

  async nextRound() {
    for (let c of this.combatants) {
      await this.update({
        _id: c.data._id,
        hasPlayed: false
      });
    }
    super.nextRound();
    return this
  }
  //---------History flag
  async _pushHistory(data) {
    let turnHistory = this.getFlag("torgeternity", "turnHistory").slice();
    turnHistory.push(data);
    return this.setFlag("torgeternity", "turnHistory", turnHistory);
  }
  async _popHistory(data) {
    let turnHistory = this.getFlag("torgeternity", "turnHistory").slice();

    let result = turnHistory.pop(data);
    return this.setFlag("torgeternity", "turnHistory", turnHistory);
    await this.setFlag("torgeternity", "turnHistory", turnHistory);
  }

  async startCombat() {
    await this.setupTurns();
    await this.setFlag("torgeternity", "turnHistory", []);
    return super.startCombat();
  }
 */

}