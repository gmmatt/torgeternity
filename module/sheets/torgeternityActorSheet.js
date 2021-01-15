import { torgeternity } from "../config.js";
import * as torgchecks from "../torgchecks.js";

export default class torgeternityStormKnightSheet extends ActorSheet {
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "actor"],
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}],
            scrollY: [".stats", ".perks", ".gear", ".powers", "background"],
            dragdrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    get template() {
        return `systems/torgeternity/templates/sheets/${this.actor.data.type}-sheet.hbs`;
    }


    getData () {
        const data = super.getData();
        var firstItem = 0

        data.meleeweapons = data.items.filter(function (item) { return item.type == "meleeweapon"});
        data.gear = data.items.filter(function (item) { return item.type == "gear"});
        data.eternityshard = data.items.filter(function (item) {return item.type == "eternityshard"});
        data.armor = data.items.filter(function (item) { return item.type == "armor"});
        data.shield = data.items.filter(function (item) { return item.type == "shield"});
        data.missileweapon = data.items.filter(function (item) { return item.type == "missileweapon"});
        data.firearm = data.items.filter(function (item) { return item.type == "firearm"});
        data.implant = data.items.filter(function (item) { return item.type == "implant"});
        data.heavyweapon = data.items.filter(function (item) { return item.type == "heavyweapon"});
        data.vehicle = data.items.filter(function (item) { return item.type == "vehicle"});
        data.perk = data.items.filter(function (item) { return item.type == "perk"});
        data.spell = data.items.filter(function (item) { return item.type == "spell"});
        data.miracle = data.items.filter(function (item) { return item.type == "miracle"});
        data.psionicpower = data.items.filter(function (item) { return item.type == "psionicpower"});
        data.specialability = data.items.filter(function (item) { return item.type == "specialability"});
        data.specialabilityRollable = data.items.filter(function (item) {return item.type == "specialability-rollable"});
        data.enhancement = data.items.filter(function (item) { return item.type == "enhancement"});

        if (this.actor.data.data.editstate === undefined) {
            this.actor.data.data.editstate = "none";
        };


        data.config = CONFIG.torgeternity;

        return data;

    }


    activateListeners(html) {
        
        //Owner-only Listeners
        if (this.actor.owner) {
            html.find(".skill-roll").click(this._onSkillRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".possibility-roll").click(this._onPossibilityRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".bonus-roll").click(this._onBonusRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-tochat").click(this._onItemChat.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-attackRoll").click(this._onAttackRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-bonusRoll").click(this._onBonusRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-powerRoll").click(this._onPowerRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".up-roll").click(this._onUpRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-create-sa").click(this._onCreateSa.bind(this));
        }

        if (this.actor.owner) {
            html.find(".item-create-rsa").click(this._onCreateSaR.bind(this));
        }

        if (this.actor.owner) {
            html.find(".toggle-threat-edit").click(this._onToggleThreatEdit.bind(this));
        }

        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if ( !this.options.editable ) return;

        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            item.sheet.render(true);
      });
  
        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteOwnedItem(li.data("itemId"));
            li.slideUp(200, () => this.render(false));
      }); 
        // Toggle Item Detail Visibility
        html.find('.item-name').click(ev => {
            let section = event.currentTarget.closest(".item");
            let detail = $(section).find(".item-detail");
            let content = detail.get(0);
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
      });
    }

    _onSkillRoll(event) {
        
        torgchecks.SkillCheck ({
            actor: this.actor,
            skillValue: event.currentTarget.dataset.skillValue,
            skillName: event.currentTarget.dataset.skillName
        })
    }
    _onPossibilityRoll(event) {
        torgchecks.PossibilityCheck ({
            actor: this.actor,
        })
    }

    _onUpRoll(event) {
        torgchecks.UpRoll ({
            actor: this.actor,
        })
    }

    _onBonusRoll(event) {
        torgchecks.BonusRoll ({
            actor: this.actor,
        })
    }

    _onItemChat(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.roll();
    }

    _onAttackRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.attack();
    }

    _onBonusRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.bonus();
    }

    _onPowerRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.power();
    }

    _onCreateSa(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability"
        };
        return this.actor.createOwnedItem(itemData,{renderSheet:true});
    }

    _onCreateSaR(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability-rollable"
        };
        return this.actor.createOwnedItem(itemData,{renderSheet:true});
    }

    _onToggleThreatEdit(event) {
        var actor = this.actor
        var toggleState = this.actor.data.data.editstate;
        event.preventDefault();
        if (toggleState === "none") {
            document.getElementById("threat-editor").style.display = "inline";
            this.actor.data.data.editstate = "inline";
            this.actor.update({"data.editstate":"inline"});
        } else {
            document.getElementById("threat-editor").style.display = "none";
            this.actor.data.data.editstate = "none";
            this.actor.update({"data.editstate":"none"});
        };
    }
}

