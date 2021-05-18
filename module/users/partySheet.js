

export default class PartySheet extends PlayerList {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "party-sheet",
      template: "systems/torgeternity/templates/playerList/partySheet.hbs",
      popOut: true,
      resizable: true
    });
  }

  getData() {

    let data = super.getData();
    data.users = game.users;
    return data;



  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find('a.item-link').click(this._clickItem.bind(this));
    html.find('h3.actorName').click(this._clickActor.bind(this));

  }
  _clickItem(ev) {
    let itemId = ev.currentTarget.getAttribute('data-itemID');
    let actorId = ev.currentTarget.getAttribute('data-actorID');
    let item = game.actors.get(actorId).getOwnedItem(itemId);
    item.sheet.render(true)

  }
  _clickActor(ev) {
    let actorId = ev.currentTarget.getAttribute('data-actorID');
    game.actors.get(actorId).sheet.render(true)

  }
}
