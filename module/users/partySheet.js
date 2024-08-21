/**
 *
 */
export default class PartySheet extends PlayerList {
  /**
   *
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'party-sheet',
      template: 'systems/torgeternity/templates/playerList/partySheet.hbs',
      popOut: true,
      resizable: true,
    });
  }

  /**
   *
   */
  getData() {
    const data = super.getData();
    data.users = game.users;
    for (const user of data.users) {
      if (user.role >= 4 || !user.character) continue;

      for (const attribute of Object.keys(user.character.system.attributes)) {
        user.character.system.attributes[attribute].localizedAttribute = game.i18n.localize(
          `torgeternity.attributes.${attribute}`
        );
      }

      for (const skill of Object.keys(user.character.system.skills)) {
        user.character.system.skills[skill].localizedSkill = game.i18n.localize(
          `torgeternity.skills.${skill}`
        );
      }
    }
    return data;
  }
  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('a.item-link').click(this._clickItem.bind(this));
    html.find('h3.actorName').click(this._clickActor.bind(this));
  }
  /**
   *
   * @param ev
   */
  _clickItem(ev) {
    const itemId = ev.currentTarget.getAttribute('data-itemID');
    const actorId = ev.currentTarget.getAttribute('data-actorID');
    const item = game.actors.get(actorId).items.get(itemId);
    item.sheet.render(true);
  }
  /**
   *
   * @param ev
   */
  _clickActor(ev) {
    const actorId = ev.currentTarget.getAttribute('data-actorID');
    game.actors.get(actorId).sheet.render(true);
  }
}
