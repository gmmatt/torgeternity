/**
 * @class PartySheet
 * 
 * Shows a table of players which includes their assigned character.
 * 
 * The constructors accepts `{activePlayers: true}` to restrict the list of players to only
 * those which are currently online.
 */
export default class PartySheet extends foundry.applications.ui.Players {

  static DEFAULT_OPTIONS = {
    id: 'party-sheet',
    tag: "form",
    classes: ['torgeternity', 'standard-form'],   // "faded-ui" removed by _initializeApplicationOptions
    window: {
      resizable: true,
      frame: true,
      positioned: true,
    },
    actions: {
      clickItem: PartySheet.#onClickItem,
      clickActor: PartySheet.#onClickActor,
    }
  }
  static PARTS = {
    body: { template: 'systems/torgeternity/templates/playerList/partySheet.hbs', scrollable: [""] },
  }


  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.users = this.options.activeActors ?
      game.users.filter(user => !user.isGM && user.active) :
      game.users.filter(user => !user.isGM);

    for (const user of context.users) {
      if (user.role === CONST.USER_ROLES.GAMEMASTER || !user.character) continue;

      for (const attribute of Object.keys(user.character.system.attributes)) {
        user.character.system.attributes[attribute].localizedAttribute =
          game.i18n.localize(`torgeternity.attributes.${attribute}`);
      }

      for (const skill of Object.keys(user.character.system.skills)) {
        user.character.system.skills[skill].localizedSkill =
          game.i18n.localize(`torgeternity.skills.${skill}`);
      }
    }
    return context;
  }

  /**
   * Remove flex-ui class (to prevent fading)
   * @param {*} options 
   * @returns 
   */
  _initializeApplicationOptions(options) {
    const appOptions = super._initializeApplicationOptions(options);
    appOptions.classes = appOptions.classes.filter(cl => cl !== 'faded-ui');
    return appOptions;
  }

  async _onRender(context, options) {
    super._onRender(context, options);
    console.log(context);
  }
  /**
   *
   * @param ev
   */
  static #onClickItem(event, target) {
    const itemId = target.getAttribute('data-itemID');
    const actorId = target.getAttribute('data-actorID');
    const item = game.actors.get(actorId).items.get(itemId);
    item.sheet.render(true);
  }
  /**
   *
   * @param ev
   */
  static #onClickActor(event, target) {
    const actorId = target.getAttribute('data-actorID');
    game.actors.get(actorId).sheet.render(true);
  }

  /**
   * Display a window showing all actors.
   */
  static showAllParty() {
    const dialog = new PartySheet({ activeActors: false });
    dialog.render(true);
  }

  /**
   * Display a window showing only active Actors.
   */
  static showActiveParty() {
    const dialog = new PartySheet({ activeActors: false });
    dialog.render(true);
  }
}
