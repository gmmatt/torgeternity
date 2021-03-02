export default class torgeternityCombatTracker extends CombatTracker {
  get template() {
    return "systems/torgeternity/templates/sidebar/combat-tracker.html";
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("input.combatant-init").change(this._onUpdateInit.bind(this));
    html.find("a.init-up").click(this._onInitUp.bind(this));
    html.find("a.init-down").click(this._onInitDown.bind(this));
  }

  async _onUpdateInit(ev) {
    let input = ev.currentTarget;
    let li = input.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);
    await this.combat.updateCombatant({
      _id: c._id,
      ["initiative"]: input.value,
    });
    this.render();
  }

  async _onInitUp(ev) {
    let btn = ev.currentTarget;
    let li = btn.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);
    console.log(li)
    await this.combat.updateCombatant({
      _id: c._id,
      ["initiative"]: c.initiative - 1,
    });
   

    this.render();
  }
  async _onInitDown(ev) {
    let btn = ev.currentTarget;
    let li = btn.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);

    await this.combat.updateCombatant({
      _id: c._id,
      ["initiative"]: c.initiative + 1,
    });
   

    this.render();
  }
}
