const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export default class torgeternityPlayerHand extends foundry.applications.sheets.CardHandConfig { // type="hand"

  static DEFAULT_OPTIONS = {
    type: "hand",
    classes: ['torgeternity', 'themed', 'theme-dark'],
    window: {
      resizable: false
    },
    position: {
      width: 800
    },
    actions: {
      controlCard: torgeternityPlayerHand.#onControlCard,
      focusCard: torgeternityPlayerHand.#onFocusCard,
      drawCosm: torgeternityPlayerHand.#onDrawCosm,
      drawDestiny: torgeternityPlayerHand.#onDrawDestiny,
      lifelike: torgeternityPlayerHand.#onLifelike
    }
  }

  static PARTS = {
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

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (options.isFirstRender) {
      // Don't set position if the window is already open
      if (game.settings.get('torgeternity', 'playerHandBottom')) {
        options.position.top = parseInt(canvas.screenDimensions[1]) - 350;
        options.position.left = parseInt(canvas.screenDimensions[0]) - 1250;
      } else {
        options.position.top = 150;
        //options.position.left = "auto";
      }
    }
  }
  /**
   *
   * @param html
   */
  async _onRender(context, options) {
    if (this.document.getFlag('torgeternity', 'lifelike')) {
      this.rotateCards(this.element);
    }
    //html.find('#lifelike').click(this.submit.bind(this));
    await super._onRender(context, options);
  }

  /**
   *
   * @param event
   */
  static async #onControlCard(_event, button) {
    const li = button.closest("li[data-card-id]");
    const stack = this.document;
    const card = stack.cards.get(li?.dataset.cardId);

    // Save any pending change to the form
    await this.submit({ operation: { render: false } });

    // Handle the control action
    switch (button.dataset.control) {
      case 'pass':
        await this.playerPassDialog(card);
        return;
      case 'create':
        return getDocumentClass('Card').createDialog({}, { parent: this.object, pack: this.document.pack });
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
        this._prepareCards('standard');
        return this.document.recall();
      case 'nextFace':
        return card.update({ face: card.face === null ? 0 : card.face + 1 });
      case 'prevFace':
        return card.update({ face: card.face === 0 ? null : card.face - 1 });
      case 'display':
        const image1 = new foundry.applications.apps.ImagePopout({ src: card.img, window: { title: card.name } });
        image1.render(true, { width: 425, height: 650 });
        image1.shareImage();
        return;
      case 'view':
        const image2 = new foundry.applications.apps.ImagePopout({ src: card.img, window: { title: card.name } });
        image2.render(true, { width: 425, height: 650 });
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
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
            }"/><span><img src="${card.img
            }"></span></span><span class="card-name">${game.i18n.localize(
              'torgeternity.chatText.discardsCard'
            )} ${card.name}</span>
              </div>`,
        });
        return;
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
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
            }"/><span><img src="${card.img
            }"></span></span><span class="card-name">${game.i18n.localize(
              'torgeternity.chatText.playsCard'
            )} ${card.name}</span>
            </div>`,
        });
        return;
    }
  }

  static #onDrawCosm() {
    this.drawCosmDialog();
  }

  static #onDrawDestiny() {
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
  static async #onLifelike(event, button) {
    console.log({ event, button })
    const isChecked = button.checked;
    await this.document.setFlag('torgeternity', 'lifelike', isChecked);
    return this.render({ force: true });
  }
  /**
   *
   * @param event
   */
  async _onChangeForm(formConfig, event) {
    const input = event.target;
    const li = input.closest('.card');
    const card = li ? this.document.cards.get(li.dataset.cardId) : null;

    // Save any pending change
    await this.submit({ operation: { render: false } });

    // Handle the control action
    switch (input.dataset.action) {
      case 'poolToggle':
        await card.setFlag('torgeternity', 'pooled', !card.getFlag('torgeternity', 'pooled'));
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
    return DialogV2.prompt({
      classes: ['torgeternity', 'themed', 'theme-dark'],
      window: { title: game.i18n.localize('torgeternity.dialogPrompts.playerPassTitle') },
      content: html,
      ok: {
        label: game.i18n.localize('torgeternity.dialogPrompts.playerPassLabel'),
        callback: async (event, button, dialog) => {
          const form = dialog.element.querySelector('form');
          const fd = new foundry.applications.ux.FormDataExtended(form).object;
          const to = game.cards.get(fd.to);
          const toName = to.name;
          card.toMessage({
            content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" 
            src="${card.img}"/><span><img src="${card.img}"></span></span><h4 class="card-name">
              ${game.i18n.localize('torgeternity.chatText.passesCard1')} 
              ${card.name} ${game.i18n.localize('torgeternity.chatText.passesCard2')}
               ${toName}.</h4></div>`,
          });
          return card.pass(to).catch((err) => {
            ui.notifications.error(err.message);
            return this;
          });
        },
      },
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

    return DialogV2.prompt({
      classes: ['torgeternity', 'themed', 'theme-dark'],
      window: { title: game.i18n.localize('torgeternity.dialogPrompts.cosmDialogTitle'), },
      content: html,
      ok: {
        label: game.i18n.localize('torgeternity.dialogPrompts.cosmDeckDialogLabel'),
        callback: (event, button, dialog) => {
          const form = dialog.element.querySelector('form');
          const fd = new foundry.applications.ux.FormDataExtended(form).object;
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
      },
    });
  }
  /**
   *
   * @param html
   */
  rotateCards(html) {
    const cardsAreas = html.querySelectorAll('.cards');
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
  static #onFocusCard(ev) {
    const card = ev.target.closest('li.card');
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
      card.style.transform = card.dataset.rot;
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
