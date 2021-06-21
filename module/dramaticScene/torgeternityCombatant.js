export default class torgCombatant extends Combatant {

  async _onCreate(data,options,user) {

    this.setFlag("world","turnTaken",false)

    await super._onCreate(data, options, user);
  }


}