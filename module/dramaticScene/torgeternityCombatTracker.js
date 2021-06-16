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
    let c = this.viewed.combatants.get(li.dataset.combatantId);
    console.log(c)
    await this.viewed.combatant.update({
      _id: c.data._id,
      ["hasPlayed"]: !c.data.hasPlayed,
    });
    console.log(c);
    if (c.hasPlayed) {
      if (c.data.tokenId == this.viewed.current.data.tokenId) {
        await this.viewed.combatant.update({
          _id: this.viewed.combatant.data._id,
          hasPlayed: true,
        });
        this.viewed.nextTurn();
      }

      this.render();
    }
  }
  async _onUpdateInit(ev) {
    let input = ev.currentTarget;
    let li = input.closest(".combatant");
    let c = this.viewed.combatants.get(li.dataset.combatantId);
    await this.viewed.combatant.update({
      _id: c.data._id,
      ["initiative"]: input.value,
    });

    this.render();
  }

  async _onInitUp(ev) {
    let btn = ev.currentTarget;
    let li = btn.closest(".combatant");
    let c = this.viewed.combatants.get(li.dataset.combatantId); //hope this works!

    if (c.data.initiative > 1) {
      await this.viewed.combatant.update({
        _id: c.data._id,
        ["initiative"]: c.data.initiative - 1,
      });
      let otherDown = this.viewed.combatants.filter(
        (oth) => oth.data.initiative >= c.data.initiative && oth.data._id != c.data._id
      );
      for (let oth of otherDown) {
        if (oth.data.initiative == c.data.initiative) {
          await this.viewed.combatant.update({
            _id: oth.data._id,
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
    let c = this.viewed.combatants.get(li.dataset.combatantId);

    if (c.data.initiative < this.viewed.combatants.length) {
      await this.viewed.combatant.update({
        _id: c.data._id,
        ["initiative"]: c.data.initiative + 1,
      });
      let otherUp = this.viewed.combatants.filter(
        (oth) => oth.initiative <= c.data.initiative && oth.data._id != c.data._id
      );

      for (let oth of otherUp) {
        if (oth.initiative == c.data.initiative) {
          await this.viewed.combatant.update({
            _id: oth.data._id,
            ["initiative"]: oth.initiative - 1,
          });
        }
      }
    }
    this.render();
  }

  async _sortVilainsFirst() {
    let vilains = this.viewed.combatants.filter((c) => c.token.disposition < 1);
    let heros = this.viewed.combatants.filter((c) => c.token.disposition > 0);
    console.log({ vilains }, { heros });
    for (let v of vilains) {
      await this.viewed.combatant.update({
        _id: v.data._id,
        ["initiative"]: vilains.indexOf(v) + 1,
      });
    }
    for (let h of heros) {
      await this.viewed.combatant.update({
        _id: h.data._id,
        ["initiative"]: vilains.length + heros.indexOf(h) + 1,
      });
    }
  }
  async _sortHerosFirst() {
    let vilains = this.viewed.combatants.filter((c) => c.token.disposition < 1);
    let heros = this.viewed.combatants.filter((c) => c.token.disposition > 0);
    console.log({ vilains }, { heros });
    for (let v of vilains) {
      await this.viewed.combatant.update({
        _id: v.data._id,
        ["initiative"]: heros.length + vilains.indexOf(v) + 1,
      });
    }
    for (let h of heros) {
      await this.viewed.combatant.update({
        _id: h.data._id,
        ["initiative"]: heros.indexOf(h) + 1,
      });
    }
  }
}
