export default class GMDecks extends Application {
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
   let data=super.getData();

   data.decks=game.user.data.flags.torgeternity.GMDeck

    // Return the data for rendering
    return data;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
      /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
 
  }
}
  