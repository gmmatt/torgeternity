export default class torgeternityCombatTracker extends CombatTracker {
  get template() {
    return "systems/torgeternity/templates/sidebar/combat-tracker.html";
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("input.combatant-init").change(this._onUpdateInit.bind(this));
    html.find("a.init-up").click(this._onInitUp.bind(this));
    html.find("a.init-down").click(this._onInitDown.bind(this));
    html.find("a.heros-first").click(this._sortHerosFirst.bind(this));
    html.find("a.vilains-first").click(this._sortVilainsFirst.bind(this));
    html.find("a.has-played").click(this._hasPlayed.bind(this));
  }
  async _hasPlayed(ev) {
    let check = ev.currentTarget;
    let li = check.closest(".combatant");
    let c = this.combat.getCombatant(li.dataset.combatantId);

    await this.combat.updateCombatant({
      _id: c._id,
      ["hasPlayed"]: !c.hasPlayed,
    });
    if (c.hasPlayed) {
      if (c.tokenId == this.combat.current.tokenId) {
        await this.combat.updateCombatant({
          _id: this.combat.combatant._id,
          hasPlayed: true,
        });
        this.combat.nextTurn();
      }

      this.render();
    }
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

  async _sortVilainsFirst() {
    let vilains = this.combat.combatants.filter((c) => c.token.disposition < 1);
    let heros = this.combat.combatants.filter((c) => c.token.disposition > 0);
    console.log({ vilains }, { heros });
    for (let v of vilains) {
      await this.combat.updateCombatant({
        _id: v._id,
        ["initiative"]: vilains.indexOf(v) + 1,
      });
    }
    for (let h of heros) {
      await this.combat.updateCombatant({
        _id: h._id,
        ["initiative"]: vilains.length + heros.indexOf(h) + 1,
      });
    }
  }
  async _sortHerosFirst() {
    let vilains = this.combat.combatants.filter((c) => c.token.disposition < 1);
    let heros = this.combat.combatants.filter((c) => c.token.disposition > 0);
    console.log({ vilains }, { heros });
    for (let v of vilains) {
      await this.combat.updateCombatant({
        _id: v._id,
        ["initiative"]: heros.length + vilains.indexOf(v) + 1,
      });
    }
    for (let h of heros) {
      await this.combat.updateCombatant({
        _id: h._id,
        ["initiative"]: heros.indexOf(h) + 1,
      });
    }
  }
}
