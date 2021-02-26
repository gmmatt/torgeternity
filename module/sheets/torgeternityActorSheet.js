import {
    torgeternity
} from "../config.js";
import * as torgchecks from "../torgchecks.js";
import {
    onManageActiveEffect,
    prepareActiveEffectCategories
} from "/systems/torgeternity/module/effects.js";

export default class torgeternityActorSheet extends ActorSheet {
    constructor(...args) {
        super(...args);

        if (this.object.data.type === "threat") {
            this.options.width = this.position.width = 400;
            this.options.height = this.position.height = 550;
        };

        this._filters = {
            effects: new Set()
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "actor"],
            width: 600,
            height: 750,
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "stats"
            }],
            scrollY: [".stats", ".perks", ".gear", ".powers", "effects", "background"],
            dragdrop: [{
                dragSelector: ".item-list .item",
                dropSelector: null
            }]
        });
    }

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/actors/${this.actor.data.type}/main.hbs`;

    }


    getData() {
        const data = super.getData();
        var firstItem = 0

        data.meleeweapons = data.items.filter(function (item) {
            return item.type == "meleeweapon"
        });
        data.gear = data.items.filter(function (item) {
            return item.type == "gear"
        });
        data.eternityshard = data.items.filter(function (item) {
            return item.type == "eternityshard"
        });
        data.armor = data.items.filter(function (item) {
            return item.type == "armor"
        });
        data.shield = data.items.filter(function (item) {
            return item.type == "shield"
        });
        data.missileweapon = data.items.filter(function (item) {
            return item.type == "missileweapon"
        });
        data.firearm = data.items.filter(function (item) {
            return item.type == "firearm"
        });
        data.implant = data.items.filter(function (item) {
            return item.type == "implant"
        });
        data.heavyweapon = data.items.filter(function (item) {
            return item.type == "heavyweapon"
        });
        data.vehicle = data.items.filter(function (item) {
            return item.type == "vehicle"
        });
        data.perk = data.items.filter(function (item) {
            return item.type == "perk"
        });
        data.spell = data.items.filter(function (item) {
            return item.type == "spell"
        });
        data.miracle = data.items.filter(function (item) {
            return item.type == "miracle"
        });
        data.psionicpower = data.items.filter(function (item) {
            return item.type == "psionicpower"
        });
        data.specialability = data.items.filter(function (item) {
            return item.type == "specialability"
        });
        data.specialabilityRollable = data.items.filter(function (item) {
            return item.type == "specialability-rollable"
        });
        data.enhancement = data.items.filter(function (item) {
            return item.type == "enhancement"
        });
        data.dramaCard = data.items.filter(function (item) {
            return item.type == "dramaCard"
        });
        data.destinyCard = data.items.filter(function (item) {
            return item.type == "destinyCard"
        });
        data.axiomCard = data.items.filter(function (item) {
            return item.type == "axiomCard"
        });


        if (this.actor.data.data.editstate === undefined) {
            this.actor.data.data.editstate = "none";
        };

        data.effects = prepareActiveEffectCategories(this.entity.effects);

        data.config = CONFIG.torgeternity;

        return data;

    }


    activateListeners(html) {

        //Owner-only Listeners
        if (this.actor.owner) {
            html.find(".skill-roll").click(this._onSkillRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".skill-edit-toggle").click(this._onSkillEditToggle.bind(this));
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
            html.find(".item-equip").click(this._onItemEquip.bind(this));
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

        if (this.actor.owner) {
            html.find(".activeDefense-roll").click(this._onActiveDefenseRoll.bind(this));
        }

        if (this.actor.owner) {
            html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.entity));
        }

        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.getOwnedItem(li.data("itemId"));
            item.sheet.render(true);
        });

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            let applyChanges = false;
            new Dialog({
                title: "Confirm Deletion",
                content: "Are you sure you want to delete this? It will be permanently removed from the sheet.",
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Yes",
                        callback: () => applyChanges = true
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "No"
                    },
                },
                default: "yes",
                close: html => {
                    if (applyChanges) {
                        const li = $(ev.currentTarget).parents(".item");
                        this.actor.deleteOwnedItem(li.data("itemId"));
                        li.slideUp(200, () => this.render(false));
                    }
                }
            }).render(true);
        });
        // Toggle Item Detail Visibility
        html.find('.item-name').click(ev => {
            let section = ev.currentTarget.closest(".item");
            let detail = $(section).find(".item-detail");
            let content = detail.get(0);
            if (content != undefined && content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                if (content) {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            }
        });
        

    }

    _onSkillRoll(event) {
        torgchecks.SkillCheck({
            actor: this.actor,
            testType: event.currentTarget.dataset.testtype,
            skillName: event.currentTarget.dataset.name,
            skillBaseAttribute: event.currentTarget.dataset.baseattribute,
            skillAdds: event.currentTarget.dataset.adds,
            skillValue: event.currentTarget.dataset.value,
            unskilledUse: event.currentTarget.dataset.unskilleduse
        })
    }

    _onSkillEditToggle(event) {

        var toggleState = this.actor.data.data.editstate;
        event.preventDefault();
        if (toggleState === null) {
            this.actor.update({
                "data.editstate": true
            });
        } else {
            this.actor.update({
                "data.editstate": null
            });
        };


    }

    _onPossibilityRoll(event) {
        torgchecks.PossibilityCheck({
            actor: this.actor,
        })
    }

    _onUpRoll(event) {
        torgchecks.UpRoll({
            actor: this.actor,
        })
    }

    _onActiveDefenseRoll(event) {
        torgchecks.activeDefenseRoll({
            actor: this.actor,
        })
    }

    _onBonusRoll(event) {
        torgchecks.BonusRoll({
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
        var weaponData = item.data.data;
        var skillData = this.actor.data.data.skills[weaponData.attackWith];
        torgchecks.weaponAttack({
            actor: this.actor,
            item: item,
            actorPic: this.actor.data.img,
            skillName: weaponData.attackWith,
            skillBaseAttribute: skillData.baseAttribute,
            skillValue: skillData.value,
            unskilledUse: skillData.unskilledUse,
            strengthValue: this.actor.data.data.attributes.strength,
            weaponName: item.data.name,
            weaponDamageType: weaponData.damageType,
            weaponDamage: weaponData.damage
        })
    };

    _onBonusRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);

        item.bonus();
    }

    _onPowerRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.getOwnedItem(itemID);
        var powerData = item.data.data;
        var skillData = this.actor.data.data.skills[powerData.skill];
        torgchecks.powerRoll({
            actor: this.actor,
            item: item,
            actorPic: this.actor.data.img,
            skillName: powerData.skill,
            skillBaseAttribute: skillData.baseAttribute,
            skillValue: skillData.value,
            powerName: item.data.name,
            powerAttack: powerData.isAttack,
            powerDamage: powerData.damage
        })
    }

    _onCreateSa(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability"
        };
        return this.actor.createOwnedItem(itemData, {
            renderSheet: true
        });
    }

    _onCreateSaR(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability-rollable"
        };
        return this.actor.createOwnedItem(itemData, {
            renderSheet: true
        });
    }

    _onToggleThreatEdit(event) {
        var actor = this.actor
        var toggleState = this.actor.data.data.editstate;
        event.preventDefault();
        if (toggleState === "none") {
            document.getElementById("threat-editor").style.display = "inline";
            this.actor.data.data.editstate = "inline";
            this.actor.update({
                "data.editstate": "inline"
            });
        } else if (toggleState === undefined) {
            document.getElementById("threat-editor").style.display = "inline";
            this.actor.data.data.editstate = "inline";
            this.actor.update({
                "data.editstate": "inline"
            });
        } else {
            document.getElementById("threat-editor").style.display = "none";
            this.actor.data.data.editstate = "none";
            this.actor.update({
                "data.editstate": "none"
            });
        };
    }

    _onItemEquip(event) {
        var actor = this.actor;
        const itemID = event.currentTarget.closest(".item").getAttribute("data-item-id");
        console.log({
            itemID
        });
        const item = this.actor.getOwnedItem(itemID);
        console.log({
            item
        })
        if (item.data.equipped === false) {
            item.data.equipped = true;
            item.update({
                "data.equipped": true
            })
        } else {
            item.data.equipped = false;
            item.update({
                "data.equipped": false
            })
        }
    }
}