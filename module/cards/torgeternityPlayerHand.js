/**
 *
 */
export default class torgeternityPlayerHand extends CardsConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: {
      drawDestiny: torgeternityPlayerHand.#onDrawDialogDestiny,
      drawCosm: torgeternityPlayerHand.#onDrawDialogCosm,
      play: torgeternityPlayerHand.#onPlayCard,
    },
    window: {
      contentClasses: ['standard-form'],
      resizable: true,
    },
    position: {
      width: 800,
      height: 740,
      top: 100,
      left: 100,
    },
  };

  /* static get defaultOptions() {
    let windowTop;
    let windowLeft;
    if (game.settings.get('torgeternity', 'playerHandBottom') === true) {
      windowTop = parseInt(canvas.screenDimensions[1] - 50);
      windowLeft = parseInt(canvas.screenDimensions[0] - 1250);
    } else {
      windowTop = 150;
      windowLeft = '';
    }
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['torgeternity', 'sheet', 'cardsHand', 'cards-config'],
      top: windowTop,
      left: windowLeft,
    });
  }*/

  // do not work correctly, always take the false, I believe flag is not correctly saved ?
  static PARTS = {
    cards: {
      template: this.document?.getFlag('torgeternity', 'lifelike')
        ? 'systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs'
        : 'systems/torgeternity/templates/cards/torgeternityPlayerHand_lifelike.hbs',
    },
  };

  /* -------------------------------------------- */
  // See actions above
  /** @inheritDoc */
  /* _prepareButtons() {
    console.log(this.document?.getFlag('torgeternity', 'lifelike'))
    const buttons = super._prepareButtons();
    if (!buttons.length) return buttons;
    const disabled = !!this.document.pack;
    buttons.unshift(
      {
        type: "button",
        action: "drawDestiny",
        icon: "fa-solid fa-plus",
        label: "CARDS.ACTIONS.Draw",
        disabled
      },
      {
        type: "button",
        action: "pass",
        icon: "fa-solid fa-share-from-square",
        label: "CARDS.ACTIONS.Pass",
        disabled
      }
    );
    return buttons;
  }*/

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */

  /**
   */
  static async #onDrawDialogDestiny() {
    const destinyDeck = game.cards.get(
      game.settings.get('torgeternity', 'deckSetting').destinyDeck
    );
    console.log(destinyDeck);
    if (destinyDeck.availableCards.length) {
      // const [firstCardKey] = destinyDeck.availableCards[0]; // need to grab a card to get toMessage access
      const card = destinyDeck.availableCards[0]; // .get(firstCardKey);
      console.log(card);
      card.toMessage({
        content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
          destinyDeck.img
        }"/><span><img src="${
          destinyDeck.img
        }"></span></span><h4 class="card-name">${game.i18n.localize(
          'torgeternity.chatText.drawsCard'
        )} ${destinyDeck.name}.</h4></div>`,
      });
    }
    await this.document.draw(destinyDeck, 1, { face: 1 });
    // await this.submit({ operation: { render: false } });
    // await this.document.drawDialog();
  }

  /**
   */
  static async #onDrawDialogCosm() {
    // extracted from _onCardControl
    const data = {};
    data.decks = game.settings.get('torgeternity', 'deckSetting');
    const html = await foundry.applications.handlebars.renderTemplate(
      'systems/torgeternity/templates/cards/drawCosmDialog.hbs',
      data
    );

    Dialog.prompt({
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
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
              cosmDeck.img
            }"/><span><img src="${
              cosmDeck.img
            }"></span></span><h4 class="card-name">${game.i18n.localize(
              'torgeternity.chatText.drawsCard'
            )} ${cosmDeck.name}.</h4></div>`,
          });
        }
        return this.document.draw(cosmDeck, 1, { face: 1 }).catch((err) => {
          ui.notifications.error(err.message);
        });
      },
    });
  }

  /**
   * @param event
   */
  static async #onPlayCard(event) {
    // extracted from _onCardControl
    const playing = event.target.closest('.card');
    const card = playing ? this.document.cards.get(playing.dataset.cardId) : null;
    await card.setFlag('torgeternity', 'pooled', false);
    if (card.type == 'destiny') {
      await card.pass(
        game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard)
      );
    } else {
      await card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').cosmDiscard));
    }
    card.toMessage({
      content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
        card.img
      }"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize(
        'torgeternity.chatText.playsCard'
      )} ${card.name}</span>
            </div>`,
    });
  }

  /**
   *
   */
  /* get template() {
    let path;
    if (this.document.getFlag('torgeternity', 'lifelike')) {
      path = 'systems/torgeternity/templates/cards/torgeternityPlayerHand_lifelike.hbs';
    } else {
      path = 'systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs';
    }
    return path;
  }*/

  /**
   *
   * @inheritdoc
   */
  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    console.log(data);

    for (const card of data?.document.cards) {
      card.typeLoc = game.i18n.localize(`torgeternity.cardTypes.${card.type}`);
    }
    return data;
  }

  /**
   *
   * @param html
   * @param context
   * @param options
   */
  async _onRender(context, options) {
    console.log(this.document?.getFlag('torgeternity', 'lifelike'));
    const html = this.element.querySelector('.window-content');
    if (this.document.getFlag('torgeternity', 'lifelike')) {
      this.rotateCards(html);
      $(html).find('.card img').click(this.focusCard.bind(this));
    }
    $(html).find('#lifelike').click(this.submit.bind(this));
    super._onRender(context, options);
  }

  /**
   *
   * @param event
   */
  async _onChangeInput(event) {
    const input = event.currentTarget;
    const li = input.closest('.card');
    const card = li ? this.object.cards.get(li.dataset.cardId) : null;

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
  /* async playerPassDialog(card) {
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
    const html = await foundry.applications.handlebars.renderTemplate(
      'systems/torgeternity/templates/cards/playerPassDialog.hbs',
      {
        cards: cards,
      }
    );

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
  }*/

  /**
   *
   */

  /* async drawCosmDialog() {
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
        return this.object.draw(cosmDeck, 1, { face: 1 }).catch((err) => {
          ui.notifications.error(err.message);
          return this;
        });
      },
    });
  }*/

  /**
   *
   * @param html
   */
  rotateCards(html) {
    const cardsAreas = $(html).find('.cards');
    const area1 = cardsAreas[0];
    console.log(area1);
    const area2 = cardsAreas[1];
    console.log(area2);
    // for (const area of cardsAreas) {
    for (let i = 0; i < area1.children.length; i++) {
      const card1 = area1.children[i];
      card1.style.transform = `rotateZ(${i * 5}deg) translateX(${i * 20}px)`;
    }
    area1.style.transform = `rotateZ(${-((area1.children.length - 1) * 2)}deg)`;

    for (let i = 0; i < area2.children.length; i++) {
      const card2 = area2.children[i];
      console.log(card2);
      card2.style.transform = `rotateZ(${-(area2.children.length - i - 1) * 5}deg) translateX(${
        -(area2.children.length - i - 1) * 20
      }px)`;
    }
    area2.style.transform = `rotateZ(${(area2.children.length - 1) * 2}deg)`;
    // }
  }
  /**
   *
   * @param ev
   */
  focusCard(ev) {
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

  /**
   *
   * @param event
   */
  async _onCardControl(event) {
    // never called
    console.log(event);
    // Shamelessly stolen from core software
    const button = event.currentTarget;
    const li = button.closest('.card');
    const card = li ? this.object.cards.get(li.dataset.cardId) : null;
    const cls = getDocumentClass('Card');

    // Save any pending change to the form
    await this._onSubmit(event, { preventClose: true, preventRender: true });

    // Handle the control action
    switch (button.dataset.action) {
      case 'play':
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
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
            card.img
          }"/><span><img src="${
            card.img
          }"></span></span><span class="card-name">${game.i18n.localize(
            'torgeternity.chatText.playsCard'
          )} ${card.name}</span>
            </div>`,
        });
        // await game.combats.apps[0].viewed.resetAll();
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
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
            card.img
          }"/><span><img src="${
            card.img
          }"></span></span><span class="card-name">${game.i18n.localize(
            'torgeternity.chatText.discardsCard'
          )} ${card.name}</span>
              </div>`,
        });
        // await game.combats.apps[0].viewed.resetAll();
        return;
      case 'drawDestiny':
        const destinyDeck = game.cards.get(
          game.settings.get('torgeternity', 'deckSetting').destinyDeck
        );
        if (destinyDeck.cards.size) {
          const [firstCardKey] = destinyDeck.cards.keys(); // need to grab a card to get toMessage access
          const card = destinyDeck.cards.get(firstCardKey);
          card.toMessage({
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
              destinyDeck.img
            }"/><span><img src="${
              destinyDeck.img
            }"></span></span><h4 class="card-name">${game.i18n.localize(
              'torgeternity.chatText.drawsCard'
            )} ${destinyDeck.name}.</h4></div>`,
          });
        }
        return this.object.draw(destinyDeck, 1, { face: 1 });
      case 'drawCosm':
        this.drawCosmDialog();
        return;
      case 'pass':
        await this.playerPassDialog(card);
        // await game.combats.apps[0].viewed.resetAll();
        return;
      case 'create':
        return cls.createDialog({}, { parent: this.object, pack: this.object.pack });
      case 'edit':
        return card.sheet.render(true);
      case 'delete':
        return card.deleteDialog();
      case 'deal':
        return this.object.dealDialog();
      // case 'draw':
      //  return this.object.drawDialog();
      case 'pass':
        return this.object.passDialog();
      case 'reset':
        this._sortStandard = true;
        return this.object.recall();
      case 'shuffle':
        this._sortStandard = false;
        return this.object.shuffle();
      case 'toggleSort':
        this._sortStandard = !this._sortStandard;
        return this.render();
      case 'nextFace':
        return card.update({ face: card.face === null ? 0 : card.face + 1 });
      case 'prevFace':
        return card.update({ face: card.face === 0 ? null : card.face - 1 });
    }
  }
}
