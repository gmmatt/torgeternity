/**
 *
 */
export default class torgeternityPlayerHand extends foundry.applications.sheets.CardHandConfig { // type="hand"

  static DEFAULT_OPTIONS = {
    type: "hand",
    window: {
      contentClasses: ['torgeternity', 'sheet', 'cardsHand', 'cards-config'],
      resizable: false
    },
    position: {
      top: 150,
      left: "auto",
      //top: parseInt(canvas.screenDimensions[1]) - game.settings.get('torgeternity', 'playerHandBottom') ? 350 : 150,
      //left: game.settings.get('torgeternity', 'playerHandBottom') ? (parseInt(canvas.screenDimensions[0]) - 1250) : "auto",
      width: 800,
      height: "auto"
    },
    actions: {
      focusCard: torgeternityPlayerHand.focusCard,
      drawCosm: torgeternityPlayerHand.drawCosm,
      drawDestiny: torgeternityPlayerHand.drawDestiny,
      play: torgeternityPlayerHand.playCard,
      display: torgeternityPlayerHand.displayCard,
      pass: torgeternityPlayerHand.passCard,
      create: torgeternityPlayerHand.createCard,
      edit: torgeternityPlayerHand.editCard,
      delete: torgeternityPlayerHand.deleteCard,
      deal: torgeternityPlayerHand.dealCard,
      draw: torgeternityPlayerHand.drawCard,
      pass: torgeternityPlayerHand.passCard,
      reset: torgeternityPlayerHand.resetCard,
      shuffle: torgeternityPlayerHand.shuffleCard,
      toggleSort: torgeternityPlayerHand.toggleSort,
      nextFace: torgeternityPlayerHand.nextFace,
      prevFace: torgeternityPlayerHand.prevFace,
      view: torgeternityPlayerHand.viewCard,
      discard: torgeternityPlayerHand.discardCard,
      //lifelike: torgeternityPlayerHand.submit
    }
  }

  static PARTS = {
    //template: (this.document.getFlag('torgeternity', 'lifelike') ? 'systems/torgeternity/templates/cards/torgeternityPlayerHand_lifelike.hbs' : 'systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs'
    cards: {
      template: 'systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs',
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
    return [
      { type: 'button', icon: 'fas fa-plus', label: 'torgeternity.dialogPrompts.drawDestiny', cssClass: "card-control", action: "drawDestiny" },
      { type: 'button', icon: 'fas fa-plus', label: 'torgeternity.dialogPrompts.drawCosm', cssClass: "card-control", action: "drawCosm" },
    ]
  }

  /**
   *
   * @param html
   */
  async _onRender(context, options) {
    let html = this.element;
    if (this.document.getFlag('torgeternity', 'lifelike')) {
      this.rotateCards(html);
    }
    //html.find('#lifelike').click(this.submit.bind(this));
    super._onRender(context, options);
  }

  /**
   *
   * @param event
   */
  async getCard(event) {
    // Shamelessly stolen from core software
    const button = event.target;
    const li = button.closest('.card');
    const card = li ? this.document.cards.get(li.dataset.cardId) : null;
    const cls = getDocumentClass('Card');

    // Save any pending change to the form
    //await this._onSubmit(event, { preventClose: true, preventRender: true });

    return card;
  }


  static async passCard(event) {
    const card = await this.getCard(event);
    await this.playerPassDialog(card);
  }
  static async createCard(event) {
    const card = await this.getCard(event);
    return cls.createDialog({}, { parent: this.object, pack: this.document.pack });
  }
  static async editCard(event) {
    const card = await this.getCard(event);
    return card.sheet.render(true);
  }
  static async deleteCard(event) {
    const card = await this.getCard(event);
    return card.deleteDialog();
  }
  static async dealCard(event) {
    const card = await this.getCard(event);
    return this.document.dealDialog();
  }
  static async drawCard(event) {
    const card = await this.getCard(event);
    return this.document.drawDialog();
  }
  static async passCard(event) {
    const card = await this.getCard(event);
    return this.document.passDialog();
  }
  static async resetCard(event) {
    const card = await this.getCard(event);
    this._sortStandard = true;
    return this.document.recall();
  }
  static async shuffleCard(event) {
    const card = await this.getCard(event);
    this._sortStandard = false;
    return this.document.shuffle();
  }
  static async toggleSort(event) {
    const card = await this.getCard(event);
    his._sortStandard = !this._sortStandard;
    return this.render();
  }
  static async nextFace(event) {
    const card = await this.getCard(event);
    return card.update({ face: card.face === null ? 0 : card.face + 1 });
  }
  static async prevFace(event) {
    const card = await this.getCard(event);
    return card.update({ face: card.face === 0 ? null : card.face - 1 });
  }

  static async displayCard(event) {
    const card = await this.getCard(event);
    const x = new ImagePopout(card.img, { title: card.name }).render(true, {
      width: 425,
      height: 650,
    });
    x.shareImage();
  }

  static async viewCard(event) {
    const card = await this.getCard(event);
    new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
  }

  static async discardCard(event) {
    const card = await this.getCard(event);
    await card.setFlag('torgeternity', 'pooled', false);
    if (card.type == 'destiny') {
      await card.pass(
        game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard)
      );
    } else {
      await card.pass(
        game.cards.get(game.settings.get('torgeternity', 'deckSetting').cosmDiscard)
      );
    }
    card.toMessage({
      content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
        }"/><span><img src="${card.img
        }"></span></span><span class="card-name">${game.i18n.localize(
          'torgeternity.chatText.discardsCard'
        )} ${card.name}</span>
              </div>`,
    });
  }

  static async playCard(event) {
    const card = await this.getCard(event);
    await card.setFlag('torgeternity', 'pooled', false);
    if (card.type == 'destiny') {
      await card.pass(
        game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard)
      );
    } else {
      await card.pass(
        game.cards.get(game.settings.get('torgeternity', 'deckSetting').cosmDiscard)
      );
    }
    card.toMessage({
      content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
        }"/><span><img src="${card.img
        }"></span></span><span class="card-name">${game.i18n.localize(
          'torgeternity.chatText.playsCard'
        )} ${card.name}</span>
            </div>`,
    });
  }

  static async drawCosm(event) {
    const card = await this.getCard(event);
    this.drawCosmDialog();
    return;
  }

  static async drawDestiny(event) {
    const card = await this.getCard(event);
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
    return this.document.draw(destinyDeck, 1, { face: 1 });
  }
  /**
   *
   * @param event
   */
  async _onChangeInput(event) {
    const input = event.currentTarget;
    const li = input.closest('.card');
    const card = li ? this.document.cards.get(li.dataset.cardId) : null;

    // Save any pending change
    await this._onSubmit(event, { preventClose: true, preventRender: true });

    // Handle the control action
    switch (input.dataset.action) {
      case 'poolToggle':
        if (card.getFlag('torgeternity', 'pooled') === true) {
          await card.setFlag('torgeternity', 'pooled', false);
          // await game.combats.apps[0].viewed.resetAll();
        } else {
          await card.setFlag('torgeternity', 'pooled', true);
          // await game.combats.apps[0].viewed.resetAll();
        }
        /* if (input.checked === true) {
                  await card.setFlag("torgeternity","pooled", true)
                } else  {
                  await card.setFlag("torgeternity","pooled", false)
                } */
        return;
    }
  }

  /**
   *
   * @param card
   */
  async playerPassDialog(card) {
    // only hands of connected characters will be shown
    const activeHand = [];
    const activePlayers = game.users.filter((u) => u.active & !u.isGM & !u.isSelf);
    activePlayers.forEach((h) => activeHand.push(h.character.getDefaultHand()));
    let cards;
    if (game.user.isGM) {
      cards = game.cards.filter(
        (c) => c !== this && c.type !== 'deck' && c.testUserPermission(game.user, 'LIMITED')
      );
    } else {
      cards = activeHand.filter(
        (c) => c.type !== 'deck' && c.testUserPermission(game.user, 'LIMITED')
      );
    }
    if (!cards.length)
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noHands'), {
        localize: true,
      });

    // Construct the dialog HTML
    const html = await foundry.applications.handlebars.renderTemplate('systems/torgeternity/templates/cards/playerPassDialog.hbs', {
      cards: cards,
    });

    // Display the prompt
    return Dialog.prompt({
      title: game.i18n.localize('torgeternity.dialogPrompts.playerPassTitle'),
      label: game.i18n.localize('torgeternity.dialogPrompts.playerPassLabel'),
      content: html,
      callback: (html) => {
        const form = html.querySelector('form.cards-dialog');
        const fd = new FormDataExtended(form).object;
        const to = game.cards.get(fd.to);
        const toName = to.name;
        card.toMessage({
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
            }"/><span><img src="${card.img}"></span></span><h4 class="card-name">${game.i18n.localize(
              'torgeternity.chatText.passesCard1'
            )} ${card.name} ${game.i18n.localize(
              'torgeternity.chatText.passesCard2'
            )} ${toName}.</h4></div>`,
        });
        return card.pass(to).catch((err) => {
          ui.notifications.error(err.message);
          return this;
        });
      },
      options: { jQuery: false },
    });
  }

  /**
   *
   */
  async drawCosmDialog() {
    const data = {};
    data.decks = game.settings.get('torgeternity', 'deckSetting');
    const html = await foundry.applications.handlebars.renderTemplate(
      'systems/torgeternity/templates/cards/drawCosmDialog.hbs',
      data
    );

    return Dialog.prompt({
      title: game.i18n.localize('torgeternity.dialogPrompts.cosmDialogTitle'),
      label: game.i18n.localize('torgeternity.dialogPrompts.cosmDeckDialogLabel'),
      content: html,
      callback: (html) => {
        const form = html[0].querySelector('form.cosm-dialog');
        const fd = new FormDataExtended(form).object;
        const cosmDeck = game.cards.get(fd.from);
        if (cosmDeck.cards.size) {
          const [firstCardKey] = cosmDeck.cards.keys(); // need to grab a card to get toMessage access
          const card = cosmDeck.cards.get(firstCardKey);
          card.toMessage({
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${cosmDeck.img
              }"/><span><img src="${cosmDeck.img
              }"></span></span><h4 class="card-name">${game.i18n.localize(
                'torgeternity.chatText.drawsCard'
              )} ${cosmDeck.name}.</h4></div>`,
          });
        }
        return this.document.draw(cosmDeck, 1, { face: 1 }).catch((err) => {
          ui.notifications.error(err.message);
          return this;
        });
      },
    });
  }
  /**
   *
   * @param html
   */
  rotateCards(html) {
    const cardsAreas = html.find('.cards');
    for (const area of cardsAreas) {
      for (let i = 0; i < area.children.length; i++) {
        const card = area.children[i];
        card.style.transform = `rotateZ(${i * 4}deg) translateX(${i * 30}px)`;
      }
      area.style.transform = `rotateZ(${-((area.children.length - 1) * 2)}deg) translateX(-${area.children.length * 15
        }px)`;
    }
  }
  /**
   *
   * @param ev
   */
  static focusCard(ev) {
    const card = ev.currentTarget.closest('li.card');
    card.classList.toggle('focusedCard');
    if (card.classList.contains('focusedCard')) {
      card.setAttribute('data-rot', card.style.transform);
      const correction =
        parseInt(card.parentElement.style.transform.replace('rotateZ(', '').replace(')deg', '')) *
        -1;
      if (game.settings.get('torgeternity', 'playerHandBottom') === true) {
        card.style.transform = `rotateZ(${correction}deg) translateY(-700px)`;
      } else {
        card.style.transform = `rotateZ(${correction}deg)`;
      }
    } else {
      card.style.transform = card.getAttribute('data-rot');
    }
  }

  /**
   *
   */
  toggleRender() {
    if (this.rendered) {
      if (this._minimized) return this.maximize();
      else return this.close();
    } else return this.render(true);
  }
}
