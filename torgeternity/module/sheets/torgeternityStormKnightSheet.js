import * as torgchecks from "../torgchecks.js";

export default class torgeternityStormKnightSheet extends ActorSheet {
    static get defaultOptions () {
        return mergeObject(super.defaultOptions, {
            template: "systems/torgeternity/templates/sheets/stormKnightSheet.hbs",
            classes: ["torgeternity", "sheet", "stormKnight"],
            width: 600,
            height: 600,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats"}],
            scrollY: [".stats", ".perks", ".gear", ".powers"],
            dragdrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    getData () {
        const data = super.getData();

        data.meleeweapons = data.items.filter(function (item) { return item.type == "meleeweapon"});
        data.gear = data.items.filter(function (item) { return item.type == "gear"});
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

        data.config = CONFIG.torgeternity;

        return data;
    }



    activateListeners(html) {
        
        //Owner-only Listeners
        if (this.actor.owner) {
            html.find(".skill-roll").click(this._onSkillRoll.bind(this));
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
    }

    _onSkillRoll(event) {
        
        torgchecks.SkillCheck ({
            skillValue: event.currentTarget.dataset.skillValue,
            skillName: event.currentTarget.dataset.skillName
        })
    }
}
