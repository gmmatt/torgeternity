/**
 * @class PartySheet
 * 
 * Shows a table of players which includes their assigned character.
 * 
 * The constructors accepts `{activePlayers: true}` to restrict the list of players to only
 * those which are currently online.
 */
const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api

export default class PartySheet extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity', 'party-sheet', 'themed', 'theme-dark'],   // "faded-ui" removed by _initializeApplicationOptions
    window: {
      contentClasses: ["standard-form"],
      resizable: true,
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
    const showAll = !this.options.activeActors;
    context.users = game.users.filter(user => !user.isGM && (showAll || user.active));

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
   *
   * @param ev
   */
  static #onClickItem(event, target) {
    const itemId = target.dataset.itemid;
    const actorId = target.dataset.actorid;
    const item = game.actors.get(actorId).items.get(itemId);
    item.sheet.render(true);
  }
  /**
   * 
   * @param {*} event 
   * @param {*} target 
   */
  static #onClickActor(event, target) {
    const actorId = target.dataset.actorid;
    game.actors.get(actorId).sheet.render(true);
  }
  /**
   * Prompt for whether ALL or only ACTIVE users are to be shown.
   */
  static showParty() {
    DialogV2.wait({
      classes: ['torgeternity'],
      window: {
        title: 'torgeternity.partySheet.openParty',
        contentClasses: ["standard-form"],
      },
      content: `${game.i18n.localize('torgeternity.partySheet.chooseParty')}`,
      buttons: [
        {
          action: "all",
          label: "torgeternity.partySheet.allPlayers",
          callback: () => {
            const dialog = new PartySheet({ activeActors: false });
            dialog.render(true);
          }
        },
        {
          action: 'active',
          label: "torgeternity.partySheet.activePlayers",
          disabled: game.users.filter(user => user.active && !user.isGM).length === 0,
          callback: () => {
            const dialog = new PartySheet({ activeActors: true });
            dialog.render(true);
          }
        }
      ]
    });
  }
}
