export default class torgeternityCombatTracker extends CombatTracker {
  get template() {
    return "systems/torgeternity/templates/sidebar/combat-tracker.html";
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("input.combatant-init").change(this._onUpdateInit.bind(this));
    html.find("a.init-up").click(this._onInitUp.bind(this));
    html.find("a.init-down").click(this._onInitDown.bind(this));
    html.find("a.has-played").click(this._onHasPlayed.bind(this));
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
    if (c.initiative > 1) {
      await this.combat.updateCombatant({
        _id: c._id,
        ["initiative"]: c.initiative - 1,
      });
      let otherDown = this.combat.combatants.filter(
        (oth) => oth.initiative >= c.initiative && oth._id != c._id
      );
      for (let oth of otherDown) {
        if (oth.initiative == c.initiative) {
          await this.combat.updateCombatant({
            _id: oth._id,
            ["initiative"]: oth.initiative + 1,
          });
        }
      }
      this.render();
    }
  }
  async _onInitDown(ev) {
    let btn = ev.currentTarget;
    let li = btn.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);
    if (c.initiative < this.combat.combatants.length) {
      await this.combat.updateCombatant({
        _id: c._id,
        ["initiative"]: c.initiative + 1,
      });
      let otherUp = this.combat.combatants.filter(
        (oth) => oth.initiative <= c.initiative && oth._id != c._id
      );

      for (let oth of otherUp) {
        if (oth.initiative == c.initiative) {
          await this.combat.updateCombatant({
            _id: oth._id,
            ["initiative"]: oth.initiative - 1,
          });
        }
      }
    }
    this.render();
  }
  async _onHasPlayed(ev) {
    ev.currentTarget.classList.replace("not-played", "played-ok");
    let li = ev.currentTarget.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);
    if (c == this.combat.combatant) {
      await this.combat.nextTurn();
    } else {
      ui.notifications.warn("other character have to play");
    }
  }
}
