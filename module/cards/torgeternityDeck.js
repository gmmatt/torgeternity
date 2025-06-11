/**
 *
 */
export default class torgeternityDeck extends foundry.applications.sheets.CardDeckConfig {  // type="deck"

  static DEFAULT_OPTIONS = {
    type: "deck",
    position: {
      width: 600,
      height: "auto"
    },
    window: {
      contentClasses: ['torgeternity', 'sheet', 'cardsDeck']
    }
  }

  static PARTS = {
    details: {
      template: 'systems/torgeternity/templates/cards/torgeternityDeck.hbs'
    }
  }

  // See https://github.com/foundryvtt/foundryvtt/issues/12999
  // Error when adding to an empty deck (such as when drawing a card for Combat!),
  // PATCH:     let maxSort = to.cards.contents.size ? Math.max(...to.cards.contents.map(c => c.sort || 0)) : 0;


  /**
   *
   * @inheritdoc
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    //context.document.cards.sort((a, b) => a.sort - b.sort);
    for (const card of context?.document.cards) {
      card.typeLoc = game.i18n.localize(`torgeternity.cardTypes.${card.type}`);
    }
    return context;
  }

  /**
   *
   * @param {Event} event The event object.
   */
  async _onCardControl(event) {
    // Shamelessly stolen from core software
    const button = event.currentTarget;
    const li = button.closest('.card');
    const card = li ? this.document.cards.get(li.dataset.cardId) : null;
    const cls = getDocumentClass('Card');

    // Save any pending change to the form
    await this._onSubmit(event, { preventClose: true, preventRender: true });

    // Handle the control action
    switch (button.dataset.action) {
      case 'play':
        card.setFlag('torgeternity', 'pooled', false);
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard));
        card.toMessage({
          content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img
            }"/><h4 class="card-name">${game.i18n.localize('torgeternity.chatText.playsCard')} ${card.data.name
            }</h4>
            </div>`,
          rollMode: game.user.isGM ? 'selfroll' : game.settings.get('core', 'rollMode'),
        });
        return;
      case 'view':
        new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
        return;
      case 'display':
        const x = new ImagePopout(card.img, { title: card.name }).render(true, {
          width: 425,
          height: 650,
        });
        x.shareImage();
        return;
      case 'discard':
        card.setFlag('torgeternity', 'pooled', false);
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard));
        card.toMessage({
          content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img
            }"/><h4 class="card-name">${game.i18n.localize('torgeternity.chatText.discardsCard')} ${card.data.name
            }</h4></div>`,
          rollMode: game.user.isGM ? 'selfroll' : game.settings.get('core', 'rollMode'),
        });
        return;
      case 'drawDestiny':
        const destinyDeck = game.cards.get(
          game.settings.get('torgeternity', 'deckSetting').destinyDeck
        );
        if (destinyDeck.data.cards.size) {
          const [firstCardKey] = destinyDeck.data.cards.keys(); // need to grab a card to get toMessage access
          const card = destinyDeck.data.cards.get(firstCardKey);
          card.toMessage({
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${destinyDeck.data.img
              }"/><span><img src="${destinyDeck.data.img
              }"></span></span><h4 class="card-name">${game.i18n.localize(
                'torgeternity.chatText.drawsCard'
              )} ${destinyDeck.data.name}.</h4></div>`,
            rollMode: game.user.isGM ? 'selfroll' : game.settings.get('core', 'rollMode'),
          });
        }
        return this.document.draw(destinyDeck);
      case 'drawCosm':
        this.drawCosmDialog();
        return;
      case 'create':
        return cls.createDialog({}, { parent: this.document, pack: this.document.pack });
      case 'edit':
        return card.sheet.render(true);
      case 'delete':
        return card.deleteDialog();
      case 'deal':
        return this.document.dealDialog();
      case 'draw':
        return this.document.drawDialog();
      case 'pass':
        return this.document.passDialog();
      case 'reset':
        this._sortStandard = true;
        return this.document.recall();
      case 'shuffle':
        this._sortStandard = false;
        return this.document.shuffle({
          chatNotification: !game.settings.get('torgeternity', 'shuffleMessageSurpress'),
        });
      case 'toggleSort':
        this._sortStandard = !this._sortStandard;
        return this.render();
      case 'nextFace':
        return card.update({ face: card.data.face === null ? 0 : card.data.face + 1 });
      case 'prevFace':
        return card.update({ face: card.data.face === 0 ? null : card.data.face - 1 });
    }
  }

  /**
   *
   */
  async passDialog() {
    const cards = game.cards.filter(
      (c) => c !== this && c.type !== 'deck' && c.testUserPermission(game.user, 'LIMITED')
    );
    if (!cards.length) return ui.notifications.warn('CARDS.PassWarnNoTargets', { localize: true });

    // Construct the dialog HTML
    const html = await foundry.applications.handlebars.renderTemplate('templates/cards/dialog-pass.html', {
      cards: cards,
      modes: {
        [CONST.CARD_DRAW_MODES.TOP]: 'CARDS.DrawModeTop',
        [CONST.CARD_DRAW_MODES.BOTTOM]: 'CARDS.DrawModeBottom',
        [CONST.CARD_DRAW_MODES.RANDOM]: 'CARDS.DrawModeRandom',
      },
    });

    // Display the prompt
    return Dialog.prompt({
      title: game.i18n.localize('CARDS.PassTitle'),
      label: game.i18n.localize('CARDS.Pass'),
      content: html,
      callback: (html) => {
        const form = html.querySelector('form.cards-dialog');
        const fd = new FormDataExtended(form).object;
        const to = game.cards.get(fd.to);
        const options = { how: fd.how, updateData: fd.down ? { face: null } : {} };
        return this.deal([to], fd.number, options).catch((err) => {
          ui.notifications.error(err.message);
          return this;
        });
      },
      options: { jQuery: false },
    });
  }
}
