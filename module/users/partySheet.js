

export default class PartySheet extends PlayerList {

	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    id: "party-sheet",
      template: "systems/torgeternity/templates/playerList/partySheet.hbs",
      popOut: true,
      resizable:true
    });
  }
 
  getData() {

    let data= super.getData();
    data.users=game.users;
    return data;
    

    
  }
  activateListeners(html) {
    super.activateListeners(html);
  }

}
