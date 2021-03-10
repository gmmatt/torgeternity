export default class TorgCombat extends Combat {
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -9999;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -9999;

    if (ia > ib) {
      return 1;
    }
    if (ia < ib) {
      return -1;
    }
  }

  _prepareCombatant(c, scene, players, settings = {}) {
    let combatant = super._prepareCombatant(c, scene, players, (settings = {}));
    combatant.flags.type = c.actor.data.type;
    if (c.players.length > 0) {
      combatant.flags.color = c.players[0].color;
    }
    return combatant;
  };
  async nextTurn() {
    
        await this.updateCombatant({
            _id:this.combatant._id,
            hasPlayed:true
        });
    
    super.nextTurn();
    return this
  }

  async nextRound() {
    for (let c of this.combatants){
        await this.updateCombatant({
            _id:c._id,
            hasPlayed:false
        });
    }
    super.nextRound();
    return this
  }
  //---------History flag
  async _pushHistory(data) {
    let turnHistory = this.getFlag("torgeternity", "turnHistory").slice();
    turnHistory.push(data);
    return this.setFlag("torgeternity", "turnHistory", turnHistory);
  }
  async _popHistory(data) {
    let turnHistory = this.getFlag("torgeternity", "turnHistory").slice();

    let result = turnHistory.pop(data);
    return this.setFlag("torgeternity", "turnHistory", turnHistory);
    await this.setFlag("torgeternity", "turnHistory", turnHistory);
  }

  async startCombat() {
    await this.setupTurns();
    await this.setFlag("torgeternity", "turnHistory", []);
    return super.startCombat();
  }

 
}
