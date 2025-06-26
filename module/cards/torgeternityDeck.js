const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export default class torgeternityDeck extends foundry.applications.sheets.CardDeckConfig {  // type="deck"

  static DEFAULT_OPTIONS = {
    type: "deck",
    classes: ['torgeternity', 'sheet', 'cardsDeck'],
    position: {
      contentClasses: ["standard-form"],
      width: 600,
      height: "auto"
    },
    actions: {
      controlCard: torgeternityDeck.onControlCard,
      // form buttons
      shuffle: torgeternityDeck.onShuffle,
      deal: torgeternityDeck.onDeal,
      reset: torgeternityDeck.onReset,
    }
  }

  static PARTS = {
    header: { template: "templates/cards/deck/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    details: { template: "systems/torgeternity/templates/cards/torgeternityDeck-details.hbs" },
    cards: { template: "systems/torgeternity/templates/cards/torgeternityDeck-cards.hbs", scrollable: ["ol[data-cards]"] },
    footer: { template: "templates/generic/form-footer.hbs" }
  }

  static TABS = {
    sheet: {
      tabs: [
        { id: "details", icon: "fa-solid fa-gears" },
        { id: "cards", icon: "fa-solid fa-id-badge" }
      ],
      initial: "cards",
      labelPrefix: "CARDS.TABS"
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

  _prepareButtons() {
    if (!this.document.isOwner) return [];

    return [
      { type: 'button', icon: 'fas fa-random', label: 'CARDS.ACTIONS.Shuffle', cssClass: "card-control", action: "shuffle" },
      { type: 'button', icon: 'fas fa-share-square', label: 'CARDS.ACTIONS.Deal', cssClass: "card-control", action: "deal" },
      { type: 'button', icon: 'fas fa-undo', label: 'CARDS.ACTIONS.Reset', cssClass: "card-control", action: "reset" },
      { type: 'submit', icon: 'fas fa-save', label: 'CARDS.ACTIONS.Save', cssClass: "card-control" },
    ]
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
          rollMode: game.user.isGM ? 'selfroll' : game.settings.get('core', 'rollMode'),
        });
        return;
      case 'view':
        new foundry.applications.apps.ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
        return;
      case 'display':
        const image = new foundry.applications.apps.ImagePopout({ src: card.img, window: { title: card.name } });
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
        const cls = getDocumentClass('Card');
        return cls.createDialog({}, { parent: this.document, pack: this.document.pack });
      case 'edit':
        return card.sheet.render(true);
      case 'delete':
        return card.deleteDialog();
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
    }
  }

  static async onShuffle() {
    this._sortStandard = false;
    return this.document.shuffle({
      chatNotification: !game.settings.get('torgeternity', 'shuffleMessageSurpress'),
    });
  }
  static async onDeal() {
    return this.document.dealDialog();
  }
  static async onReset() {
    this._sortStandard = true;
    return this.document.recall();
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
      },
    });
  }
}
