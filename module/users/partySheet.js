/**
 *
 */
export default class PartySheet extends PlayerList {
  /**
   *
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "party-sheet",
      template: "systems/torgeternity/templates/playerList/partySheet.hbs",
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
    return data;
  }
  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a.item-link").click(this._clickItem.bind(this));
    html.find("h3.actorName").click(this._clickActor.bind(this));
  }
  /**
   *
   * @param ev
   */
  _clickItem(ev) {
    const itemId = ev.currentTarget.getAttribute("data-itemID");
    const actorId = ev.currentTarget.getAttribute("data-actorID");
    const item = game.actors.get(actorId).items.get(itemId);
    item.sheet.render(true);
  }
  /**
   *
   * @param ev
   */
  _clickActor(ev) {
    const actorId = ev.currentTarget.getAttribute("data-actorID");
    game.actors.get(actorId).sheet.render(true);
  }
}
