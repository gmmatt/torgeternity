import PartySheet from "./partySheet.js"
export default class TorgeternityPlayerList extends PlayerList {




  get template() {
    return "systems/torgeternity/templates/playerList/playerList.hbs";
  }
  getData(){
    let data=super.getData();
    data.self=game.user;
    return data
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".players-popout").click(this.renderPopout.bind(this));
  }

  
  createPopout() {
    let party = new PartySheet
    
    return party;
  }

		renderPopout() {
	  this.createPopout().render(true);
  }

}
