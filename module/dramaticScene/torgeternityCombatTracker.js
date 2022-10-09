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
        html.find("a.dsr-counter").click(this._dsrCounter.bind(this));
        html.find("a.player-dsr-counter").click(this._playerDsrCounter.bind(this));
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
        if (c.flags.world.turnTaken === false) {
            await c.setFlag("world", "turnTaken", true)
        } else {
            await c.setFlag("world", "turnTaken", false)
        }

    }
    async _onUpdateInit(ev) {
        let input = ev.currentTarget;
        let li = input.closest(".combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId);
        await this.viewed.combatant.update({
            _id: c._id,
            ["initiative"]: input.value,
        });

        this.render();
    }

    async _onInitUp(ev) {
        let btn = ev.currentTarget;
        let li = btn.closest(".combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId); //hope this works!
        await this.viewed.combatant.update({
            _id: c.id,
            ["initiative"]: c.initiative + 1,
        });
        this.render();

    }
    async _onInitDown(ev) {
        let btn = ev.currentTarget;
        let li = btn.closest("li.combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId); //hope this works!
        await this.viewed.combatant.update({
            _id: c.id,
            ["initiative"]: c.initiative - 1,
        });
        this.render();
    }

    async _sortVilainsFirst() {
        await this.viewed.resetAll()
        var combatantArray = null;
        var i = 0
        for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
            if (this.viewed.turns[i].token.disposition < 1) { // token disposition is neutral or hostile (0 or -1)
                await this.viewed.turns[i].update({
                    "initiative": 2
                })
            } else { // token disposition is frinedly 1
                await this.viewed.turns[i].update({
                    "initiative": 1
                })
            }
        }
        this.render()

    }

    async _sortHeroesFirst() {
        await this.viewed.resetAll();
        var combatantArray = null;
        var i = 0
        for (combatantArray = this.viewed.turns; i < combatantArray.length; i++) {
            if (this.viewed.turns[i].token.disposition < 1) { // token disposition is neutral or hostile (0 or -1)
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
    }

    async _dsrCounter(ev) {
        let currentStep = this.viewed.getFlag("torgeternity", "dsrStage");

        switch (currentStep) {
            case undefined:
                this.viewed.setFlag("torgeternity", "dsrStage", "A");
                break;
            case "":
                this.viewed.setFlag("torgeternity", "dsrStage", "A");
                break;
            case "A":
                this.viewed.setFlag("torgeternity", "dsrStage", "B");
                break;
            case "B":
                this.viewed.setFlag("torgeternity", "dsrStage", "C");
                break;
            case "C":
                this.viewed.setFlag("torgeternity", "dsrStage", "D");
                break;
            case "D":
                this.viewed.setFlag("torgeternity", "dsrStage", "");
                break;
        }

    }

    async _playerDsrCounter(ev) {
        let btn = ev.currentTarget;
        let li = btn.closest("li.combatant");
        let c = this.viewed.combatants.get(li.dataset.combatantId);

        let currentStep = c.getFlag("torgeternity", "dsrStage");

        switch (currentStep) {
            case undefined:
                c.setFlag("torgeternity", "dsrStage", "A");
                break;
            case "":
                c.setFlag("torgeternity", "dsrStage", "A");
                break;
            case "A":
                c.setFlag("torgeternity", "dsrStage", "B");
                break;
            case "B":
                c.setFlag("torgeternity", "dsrStage", "C");
                break;
            case "C":
                c.setFlag("torgeternity", "dsrStage", "D");
                break;
            case "D":
                c.setFlag("torgeternity", "dsrStage", "");
                break;
        }


    }


}