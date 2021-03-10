export default class GMDecks extends FormApplication {
  constructor(options) {
    super(options);
  }

  /* -------------------------------------------- */

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "GMDecks",
      template: "systems/torgeternity/templates/cards/GMDecks.hbs",
      popOut: false,
      title: "GM deck",
    });
  }

  /* -------------------------------------------- */
  /*  Application Rendering
      /* -------------------------------------------- */

  /** @override */
  render(force, context = {}) {
    return super.render(force, context);
  }

  /* -------------------------------------------- */

  /** @override */
  getData(options) {
    let data = super.getData();
    data.decks = CONFIG.torgeternity.gameCards.GMDecks
    return data;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
      /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    html.find(".deck-config").click(this._onDeckConfig.bind(this));
  }

  async _onDeckConfig(ev) {
    let data = this.getData();
    console.log(data);
    let deckName = ev.currentTarget
      .closest("li.deck")
      .getAttribute("data-deck");
      let configData={};
      configData.targetDeck=data.decks[deckName];
    for (let pack of game.packs) {
      if (pack.entity == "Item") {
        console.log(pack);
        configData.availableComp = [];
        configData.availableComp.push(game.packs.get(pack.collection));
      }
    };
    
     
    const html = await renderTemplate(
      "systems/torgeternity/templates/cards/deckConfig.hbs",
      configData
    );

    let deckConfig = new Dialog({
      title: "deck config",
      content: html,
      buttons: {
        one: {
          label: "ok",
          callback: (html) => validConfig(html, configData),
        },
        two: {
          label: "cancel",
        },
      },
      default: "two",
      close: () => {},
    });
    deckConfig.render(true);

    function validConfig(html, configData) {
      let checks = html.find("input.include-compendium");
      console.log({ configData });
      let newDeck = user.getFlag("torgeternity", "GMDeck");
      console.log({ newDeck });
      newDeck[deckName].compendiums = [];
      //referencing compendiums names
      for (let checkbox of checks) {
        if (checkbox.checked) {
          newDeck[deckName].compendiums.push(checkbox.value);
          console.log(checkbox.value);
        }
      }
      console.log({ newDeck });

      /*
     //pushing cards  in deck
     for (let comp of decks[deckName].compendiums){
      let validatedComp=game.packs.filter(c=>c.title==comp);

     }
     */
      console.log(decks);
      user.setFlag("torgeternity", "GMDeck", newDeck);
    }
  }
}
