export default class torgCombatant extends Combatant {

    async _preCreate(data, options, user) {

        this.data.update({
        flags: {
          type: data.actor.data.type,
          color: data.players[0].color
        }
      });
  
      await super._preCreate(data, options, user);
    }

    
}