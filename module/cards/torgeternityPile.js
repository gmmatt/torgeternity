const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export default class torgeternityPile extends foundry.applications.sheets.CardPileConfig { // type = "pile"

  static DEFAULT_OPTIONS = {
    type: "pile",
    classes: ['torgeternity', 'sheet', 'cardsPile', 'cards-config'],
    window: {
      contentClasses: ["standard-form"],
    },
    position: {
      width: 400,
      height: "auto"
    },
    actions: {
      controlCard: torgeternityPile.onControlCard,
      reset: torgeternityPile.onReset,
      shuffle: torgeternityPile.onShuffle,
    }
  }

  static PARTS = {
    cards: {
      template: 'systems/torgeternity/templates/cards/torgeternityPile.hbs',
      root: true,
      scrollable: ["ol[data-cards]"]
    },
    footer: { template: "templates/generic/form-footer.hbs" }
  }

  /**
   *
   * @inheritdoc
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    for (const card of context?.document.cards) {
      card.typeLoc = game.i18n.localize(`torgeternity.cardTypes.${card.type}`);
    }
    return context;
  }

  _prepareButtons() {
    /* if owner */
    if (this.document.isOwner)
      return [
        { type: 'button', icon: 'fas fa-random', label: 'CARDS.ACTIONS.Shuffle', cssClass: "card-control", action: "shuffle" },
        { type: 'button', icon: 'fas fa-share-square', label: 'CARDS.ACTIONS.Pass', cssClass: "card-control", action: "pass" },
        { type: 'button', icon: 'fas fa-recycle', label: 'torgeternity.sheetLabels.return', cssClass: "card-control", action: "return", tooltip: 'torgeternity.dialogPrompts.return' },
      ]
    else
      return [];
  }

  /**
   *
   * @param {Event} event The event object.
   */

  static async onControlCard(_event, button) {
    const li = button.closest("li[data-card-id]");
    const stack = this.document;
    const card = stack.cards.get(li?.dataset.cardId);

    // Save any pending change to the form
    await this.submit({ operation: { render: false } });

    // Handle the control action
    switch (button.dataset.control) {
      case 'play':
        card.setFlag('torgeternity', 'pooled', false);
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard));
        card.toMessage({
          content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img
            }"/><h4 class="card-name">${game.i18n.localize('torgeternity.chatText.playsCard')} ${card.name
            }</h4>
            </div>`,
        });
        return;
      case 'view':
        new foundry.applications.apps.ImagePopout({ src: card.img }, { title: card.name }).render(true, { width: 425, height: 650 });
        return;
      case 'display':
        const image = new foundry.applications.apps.ImagePopout({ src: card.img }, { title: card.name });
        image.render(true, {
          width: 425,
          height: 650,
        });
        image.shareImage();
        return;
      case 'discard':
        card.setFlag('torgeternity', 'pooled', false);
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard));
        card.toMessage({
          content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img
            }"/><h4 class="card-name">${game.i18n.localize('torgeternity.chatText.discardsCard')} ${card.name
            }</h4></div>`,
        });
        return;
      case 'drawDestiny':
        const destinyDeck = game.cards.get(
          game.settings.get('torgeternity', 'deckSetting').destinyDeck
        );
        if (destinyDeck.cards.size) {
          const [firstCardKey] = destinyDeck.cards.keys(); // need to grab a card to get toMessage access
          const card = destinyDeck.cards.get(firstCardKey);
          card.toMessage({
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${destinyDeck.img
              }"/><span><img src="${destinyDeck.img
              }"></span></span><h4 class="card-name">${game.i18n.localize(
                'torgeternity.chatText.drawsCard'
              )} ${destinyDeck.name}.</h4></div>`,
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
      case 'toggleSort':
        this._sortStandard = !this._sortStandard;
        return this.render();
      case 'nextFace':
        return card.update({ face: card.face === null ? 0 : card.face + 1 });
      case 'prevFace':
        return card.update({ face: card.face === 0 ? null : card.face - 1 });
      case 'return':
        for (let i = 0; i < this.document.cards.size; i++) {
          this.document.cards.contents[i].recall();
        }
    }
  }

  static onReset() {
    this._sortStandard = true;
    return this.document.recall();
  }
  static async onShuffle(event) {
    const card = await this.getCard(event);
    this._sortStandard = false;
    return this.document.shuffle();
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
    return DialogV2.prompt({
      window: { title: game.i18n.localize('CARDS.PassTitle') },
      content: html,
      ok: {
        label: game.i18n.localize('CARDS.Pass'),
        callback: (event, button, dialog) => {
          const form = dialog.element.querySelector('form');
          const fd = new foundry.applications.ux.FormDataExtended(form).object;
          const to = game.cards.get(fd.to);
          const options = { how: fd.how, updateData: fd.down ? { face: null } : {} };
          return this.deal([to], fd.number, options).catch((err) => {
            ui.notifications.error(err.message);
            return this;
          });
        },
      }
    });
  }
}
