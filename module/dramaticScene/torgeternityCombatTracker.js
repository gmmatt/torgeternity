export default class torgeternityCombatTracker extends CombatTracker {
    get template() {
        return "systems/torgeternity/templates/sidebar/combat-tracker.html";
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find("input.combatant-init").change(this._onUpdateInit.bind(this));
        html.find("a.init-up").click(this._onInitUp.bind(this));
        html.find("a.init-down").click(this._onInitDown.bind(this));
        html.find("a.heros-first").click(this._sortHeroesFirst.bind(this));
        html.find("a.vilains-first").click(this._sortVilainsFirst.bind(this));
        html.find("a.has-played").click(this._hasPlayed.bind(this));
        // html.find(".fa-check-circle").click(this._toggleCheck.bind(this));
    }

    _toggleCheck(ev) {

        ev.currentTarget.classList.toggle("fas");
        ev.currentTarget.classList.toggle("far");
        ev.currentTarget.classList.toggle("playedOK");

    }

    async _hasPlayed(ev) {
        let check = ev.currentTarget;
        // check.toggleClass('fa-check-square fa-minus-circle')


        let li = check.closest(".combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId);
        console.log(c)
        if (c.data.flags.world.turnTaken === false) {
            await c.setFlag("world", "turnTaken", true)
        } else {
            await c.setFlag("world", "turnTaken", false)
        }

        /*
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
        */
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
        console.log(c.name);
        await this.viewed.combatant.update({
            _id: c.data.id,
            ["initiative"]: c.data.initiative + 1,
        });
        this.render();
        /*
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
        */
    }
    async _onInitDown(ev) {
        let btn = ev.currentTarget;
        let li = btn.closest("li.combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId); //hope this works!
        console.log(c.name);
        await this.viewed.combatant.update({
            _id: c.data.id,
            ["initiative"]: c.data.initiative - 1,
        });
        this.render();
        /*
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
        this.render();*/
    }

    async _sortVilainsFirst() {
        await this.viewed.resetAll()
        var combatantArray = null;
        var i = 0
        for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
            if (this.viewed.turns[i].token.data.disposition < 1) { // token disposition is neutral or hostile (0 or -1)
                await this.viewed.turns[i].update({
                    "initiative": 2
                })
            } else { // token disposition is frinedly 1
                await this.viewed.turns[i].update({
                    "initiative": 1
                })
            }
        }
        // await this.viewed.setupTurns()
        this.render()

        /* Old Code 
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
        } */
    }

    async _sortHeroesFirst() {
        await this.viewed.resetAll();
        var combatantArray = null;
        var i = 0
        for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
            if (this.viewed.turns[i].token.data.disposition < 1) { // token disposition is neutral or hostile (0 or -1)
                await this.viewed.turns[i].update({
                    "initiative": 1
                })
            } else { // token disposition is frinedly 1
                await this.viewed.turns[i].update({
                    "initiative": 2
                })
            }
        }
        // await this.viewed.setupTurns()
        this.render()

        /* Old Code
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
  */
    }
}