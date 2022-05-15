import {
    torgeternity
} from "../config.js";
import * as torgchecks from "../torgchecks.js";
import {
    onManageActiveEffect,
    prepareActiveEffectCategories
} from "/systems/torgeternity/module/effects.js";
import { skillDialog } from "/systems/torgeternity/module/skill-dialog.js";
import { attackDialog } from "/systems/torgeternity/module/attack-dialog.js";
import { interactionDialog } from "/systems/torgeternity/module/interaction-dialog.js";

export default class torgeternityActorSheet extends ActorSheet {
    constructor(...args) {
        super(...args);

        if (this.object.data.type === "threat") {
            this.options.width = this.position.width = 450;
            this.options.height = this.position.height = 350;

        }

        this._filters = {
            effects: new Set()
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "actor"],
            width: 773,
            height: 860,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
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

        data.meleeweapons = data.items.filter(function(item) {
            return item.type == "meleeweapon"
        });
        data.customAttack = data.items.filter(function(item) {
            return item.type == "customAttack"
        });
        data.customSkill = data.items.filter(function(item) {
            return item.type == "customSkill"
        });
        data.gear = data.items.filter(function(item) {
            return item.type == "gear"
        });
        data.eternityshard = data.items.filter(function(item) {
            return item.type == "eternityshard"
        });
        data.armor = data.items.filter(function(item) {
            return item.type == "armor"
        });
        data.shield = data.items.filter(function(item) {
            return item.type == "shield"
        });
        data.missileweapon = data.items.filter(function(item) {
            return item.type == "missileweapon"
        });
        data.firearm = data.items.filter(function(item) {
            return item.type == "firearm"
        });
        data.implant = data.items.filter(function(item) {
            return item.type == "implant"
        });
        data.heavyweapon = data.items.filter(function(item) {
            return item.type == "heavyweapon"
        });
        data.vehicle = data.items.filter(function(item) {
            return item.type == "vehicle"
        });
        data.perk = data.items.filter(function(item) {
            return item.type == "perk"
        });
        data.spell = data.items.filter(function(item) {
            return item.type == "spell"
        });
        data.miracle = data.items.filter(function(item) {
            return item.type == "miracle"
        });
        data.psionicpower = data.items.filter(function(item) {
            return item.type == "psionicpower"
        });
        data.specialability = data.items.filter(function(item) {
            return item.type == "specialability"
        });
        data.specialabilityRollable = data.items.filter(function(item) {
            return item.type == "specialability-rollable"
        });
        data.enhancement = data.items.filter(function(item) {
            return item.type == "enhancement"
        });
        data.dramaCard = data.items.filter(function(item) {
            return item.type == "dramaCard"
        });
        data.destinyCard = data.items.filter(function(item) {
            return item.type == "destinyCard"
        });
        data.cosmCard = data.items.filter(function(item) {
            return item.type == "cosmCard"
        });


        /* if (this.actor.data.data.editstate === undefined) {
            this.actor.data.data.editstate = "none";
        }; */

        data.effects = prepareActiveEffectCategories(this.document.effects);

        data.config = CONFIG.torgeternity;
        data.disableXP = true;
        if (game.user.isGM || !game.settings.get("torgeternity", "disableXP")) {
            data.disableXP = false
        }

        return data;

    }


    // Skills are not Foundry "items" with IDs, so the skill data is not automatically
    //    inserted by Foundry's _onDragStart. Instead we call that function because it
    //    does some needed work and then add in the skill data in a way that will be
    //    retrievable when the skill is dropped on the macro bar.
    _skillAttrDragStart(evt) {
        this._onDragStart(evt);
        let skillAttrData = {
            type: evt.currentTarget.attributes["data-testtype"].value,
            data: {
                name: evt.currentTarget.attributes["data-name"].value,
                attribute: evt.currentTarget.attributes["data-baseattribute"].value,
                adds: evt.currentTarget.attributes["data-adds"].value,
                value: evt.currentTarget.attributes["data-value"].value,
                unskilledUse: evt.currentTarget.attributes["data-unskilleduse"].value,
                attackType: ""
            }
        };
        evt.dataTransfer.setData('text/plain', JSON.stringify(skillAttrData));
    }

    // See _skillAttrDragStart above.
    _interactionDragStart(evt) {
        this._onDragStart(evt);
        let skillNameKey = evt.currentTarget.attributes["data-name"].value;
        let skill = this.actor.data.data.skills[skillNameKey];
        let value = skill.value ? skill.value : skill.adds + this.actor.data.data.attributes[skill.baseAttribute];
        let skillAttrData = {
            type: "interaction",
            data: {
                name: skillNameKey,
                attribute: skill.baseAttribute,
                adds: skill.adds,
                value: value,
                unskilledUse: skill.unskilledUse,
                attackType: evt.currentTarget.attributes["data-attack-type"].value
            }
        };
        evt.dataTransfer.setData('text/plain', JSON.stringify(skillAttrData));
    }

    activateListeners(html) {

        //Owner-only Listeners
        if (this.actor.isOwner) {
            let handler = ev => this._onDragStart(ev);
            // Find all items on the character sheet.
            html.find('a.item-name').each((i, a) => {
                // Ignore for the header row.
                if (a.classList.contains("item-header")) return;
                // Add draggable attribute and dragstart listener.
                a.setAttribute("draggable", true);
                a.addEventListener("dragstart", handler, false);
            });
            // Find all attributes on the character sheet.
            handler = ev => this._skillAttrDragStart(ev);
            html.find('a.skill-roll').each((i, a) => {
                // Add draggable attribute and dragstart listener.
                a.setAttribute("draggable", true);
                a.addEventListener("dragstart", handler, false);
            });
            // Find all interactions on the character sheet.
            handler = ev => this._interactionDragStart(ev);
            html.find('a.interaction-attack').each((i, a) => {
                // Add draggable attribute and dragstart listener.
                a.setAttribute("draggable", true);
                a.addEventListener("dragstart", handler, false);
            });
        }

        if (this.actor.isOwner) {
            html.find(".skill-roll").click(this._onSkillRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".skill-edit-toggle").click(this._onSkillEditToggle.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".possibility-roll").click(this._onPossibilityRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".bonus-roll").click(this._onBonusRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-tochat").click(this._onItemChat.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-attackRoll").click(this._onAttackRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".interaction-attack").click(this._onInteractionAttack.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-bonusRoll").click(this._onBonusRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-powerRoll").click(this._onPowerRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".up-roll").click(this._onUpRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-equip").click(this._onItemEquip.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-create-sa").click(this._onCreateSa.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".item-create-rsa").click(this._onCreateSaR.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".activeDefense-roll").click(this._onActiveDefenseRoll.bind(this));
        }

        if (this.actor.isOwner) {
            html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.document));
        }

        if (this.actor.isOwner) {
            html.find(".apply-fatigue").click(ev => {
                let newShock = parseInt(this.actor.data.data.shock.value) + parseInt(ev.currentTarget.dataset.fatigue)
                this.actor.update({ 'data.shock.value': newShock })
            });
        }

        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Open Cards Hand

        html.find('.open-hand').click(this.onOpenHand.bind(this));



        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const li = $(ev.currentTarget).parents(".item");
            const item = this.actor.items.get(li.data("itemId"));
            item.sheet.render(true);
        });

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            let applyChanges = false;
            new Dialog({
                title: game.i18n.localize('torgeternity.dialogWindow.itemDeletion.title'),
                content: game.i18n.localize('torgeternity.dialogWindow.itemDeletion.content'),
                buttons: {
                    yes: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize('torgeternity.yesNo.true'),
                        callback: () => applyChanges = true
                    },
                    no: {
                        icon: '<i class="fas fa-times"></i>',
                        label: game.i18n.localize('torgeternity.yesNo.false')
                    },
                },
                default: "yes",
                close: html => {
                    if (applyChanges) {
                        const li = $(ev.currentTarget).parents(".item");
                        this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
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

        //compute adds from total for threats
        if (this.actor.type == "threat") {
            html.find('.threat-skill-total').change(this.setThreatAdds.bind(this));


        }
    }
    async setThreatAdds(event) {
        let data = this.actor.data;

        let skill = event.currentTarget.dataset.skill
        let skillObject = this.actor.data.data.skills[skill]

        data.data.skills[skill].adds = event.currentTarget.value - this.actor.data.data.attributes[skillObject.baseAttribute];
        this.actor.update(data);
    }
    async onOpenHand(event) {


        let characterHand = this.object.getDefaultHand();
        // if default hand => render it 
        if (characterHand) {
            characterHand.sheet.render(true);
        } else {
            await this.object.createDefaultHand()
        }

    }
    async _onSkillRoll(event) {
        const skillName = event.currentTarget.dataset.name;
        const attributeName = event.currentTarget.dataset.baseattribute;
        const isAttributeTest = (event.currentTarget.dataset.testtype === "attribute");
        let test = {
            testType: event.currentTarget.dataset.testtype,
            actor: this.actor,
            actorPic: this.actor.data.img,
            actorType: this.actor.data.type,
            skillName: isAttributeTest ? game.i18n.localize("torgeternity.attributes." + attributeName) : game.i18n.localize("torgeternity.skills." + skillName),
            skillBaseAttribute: game.i18n.localize("torgeternity.attributes." + attributeName),
            skillAdds: event.currentTarget.dataset.adds,
            skillValue: event.currentTarget.dataset.value,
            unskilledUse: event.currentTarget.dataset.unskilleduse,
            woundModifier: parseInt(-(this.actor.data.data.wounds.value)),
            stymiedModifier: parseInt(this.actor.data.data.stymiedModifier),
            darknessModifier: parseInt(this.actor.data.data.darknessModifier),
            type: event.currentTarget.dataset.testtype,
            possibilityTotal: 0,
            upTotal: 0,
            heroTotal: 0,
            dramaTotal: 0,
            cardsPlayed: 0,
            sizeModifier: 0,
            vulnerableModifier: 0,
            disfavored: false
        }
        if (this.actor.data.data.stymiedModifier === parseInt(-2)) {
            test.stymiedModifier = -2
        } else if (this.actor.data.data.stymiedModifier === -4) {
            test.stymiedModifier = -4
        }

        if (event.shiftKey) {
            let testDialog = new skillDialog(test);
            testDialog.render(true);
        } else {
            torgchecks.SkillCheck(test);
        }
    }

    _onInteractionAttack(event) {
        let test = {
            testType: "interactionAttack",
            actor: this.actor,
            actorPic: this.actor.data.img,
            actorType: this.actor.data.type,
            interactionAttackType: event.currentTarget.getAttribute("data-attack-type"),
            skillName: game.i18n.localize("torgeternity.skills." + event.currentTarget.getAttribute("data-name")),
            skillBaseAttribute: game.i18n.localize("torgeternity.skills." + event.currentTarget.getAttribute("data-base-attribute")),
            skillAdds: event.currentTarget.getAttribute("data-adds"),
            skillValue: event.currentTarget.getAttribute("data-skill-value"),
            unskilledUse: true,
            woundModifier: parseInt(-(this.actor.data.data.wounds.value)),
            stymiedModifier: parseInt(this.actor.data.data.stymiedModifier),
            darknessModifier: 0,
            type: "interactionAttack",
            targetDefenseSkill: "",
            targetDefenseValue: 0,
            possibilityTotal: 0,
            upTotal: 0,
            heroTotal: 0,
            dramaTotal: 0,
            cardsPlayed: 0,
            sizeModifier: 0,
            vulnerableModifier: 0,
            disfavored: false
        }

        // Exit if no target or get target data
        if (Array.from(game.user.targets).length === 0) {
            var needTargetData = {
                user: game.user.data._id,
                speaker: ChatMessage.getSpeaker(),
                owner: this.actor,
            };

            var templateData = {
                message: game.i18n.localize("torgeternity.chatText.check.interactionNeedTarget"),
                actorPic: this.actor.data.img
            };

            const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

            templatePromise.then(content => {
                needTargetData.content = content;
                ChatMessage.create(needTargetData);
            })

            return;
        } else {
            var target = Array.from(game.user.targets)[0];
            var targetType = target.actor.data.type;
            test.vulnerableModifier = target.actor.data.data.vulnerableModifier;
            if (test.interactionAttackType === "intimidation") {
                test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.intimidation");
                test.targetDefenseValue = target.actor.data.data.intimidationDefense;
            } else if (test.interactionAttackType === "maneuver") {
                test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.maneuver");
                test.targetDefenseValue = target.actor.data.data.maneuverDefense;
            } else if (test.interactionAttackType === "taunt") {
                test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.taunt");
                test.targetDefenseValue = target.actor.data.data.tauntDefense;
            } else if (test.interactionAttackType === "trick") {
                test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.trick");
                test.targetDefenseValue = target.actor.data.data.trickDefense;
            }
        }


        if (this.actor.data.data.stymiedModifier === parseInt(-2)) {
            test.stymiedModifier = -2
        } else if (this.actor.data.data.stymiedModifier === -4) {
            test.stymiedModifier = -4
        }

        let testDialog = new interactionDialog(test);
        testDialog.render(true);

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
            actor: this.actor
        })
    }

    _onBonusRoll(event) {
        torgchecks.BonusRoll({
            actor: this.actor,
        })
    }

    _onItemChat(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemID);

        item.roll();
    }

    _onAttackRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemID);
        var weaponData = item.data.data;
        var attackWith = weaponData.attackWith;
        var skillData = this.actor.data.data.skills[weaponData.attackWith];
        var sizeModifier = 0;
        var vulnerableModifier = 0;
        var targetToughness = 0;
        var targetArmor = 0;
        // var targetDefenseSkill = "Dodge";
        // var targetDefenseValue = 0;
        var defaultDodge = false;
        var defaultMelee = false;
        var defaultUnarmed = false;
        var targetDodge = 0;
        var targetMelee= 0;
        var targetUnarmed = 0;



        // Exit if no target or get target data
        if (event.shiftKey) {
            if (Array.from(game.user.targets).length === 0) {
                var needTargetData = {
                    user: game.user.data._id,
                    speaker: ChatMessage.getSpeaker(),
                    owner: this.actor,
                };

                var templateData = {
                    message: game.i18n.localize('torgeternity.chatText.check.needTarget'),
                    actorPic: this.actor.data.img
                };

                const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

                templatePromise.then(content => {
                    needTargetData.content = content;
                    ChatMessage.create(needTargetData);
                })

                return;
            } else {
                var target = Array.from(game.user.targets)[0];
                var targetType = target.actor.data.type;

                // Set target size bonus
                if (target.actor.data.data.details.sizeBonus === "tiny") {
                    sizeModifier = -6;
                } else if (target.actor.data.data.details.sizeBonus === "verySmall") {
                    sizeModifier = -4;
                } else if (target.actor.data.data.details.sizeBonus === "small") {
                    sizeModifier = -2;
                } else if (target.actor.data.data.details.sizeBonus === "large") {
                    sizeModifier = 2;
                } else if (target.actor.data.data.details.sizeBonus === "veryLarge") {
                    sizeModifier = 4;
                } else {
                    sizeModifier = 0;
                }

                // Set target defense values
                targetDodge = target.actor.data.data.dodgeDefense;
                targetMelee = target.actor.data.data.meleeWeaponsDefense;
                targetUnarmed = target.actor.data.data.unarmedCombatDefense;

                vulnerableModifier = target.actor.data.data.vulnerableModifier;
                targetToughness = target.actor.data.data.other.toughness;
                targetArmor = target.actor.data.data.other.armor;
                if (attackWith === "fireCombat" || attackWith === "energyWeapons" || attackWith === "heavyWeapons" || attackWith === "missileWeapons") {
                    defaultDodge=true;
                } else {
                    if (target.actor.data.data.skills.meleeWeapons.adds > 0 || (targetType === "threat" && target.actor.data.data.skills.meleeWeapons.value > 0)) {
                        defaultMelee = true;
                    } else {
                        defaultUnarmed = true;
                    }
                }
            }
        };

        var test = {

            testType: "attack",
            actor: this.actor,
            actorType: this.actor.data.type,
            item: this.actor.items.get(itemID),
            actorPic: this.actor.data.img,
            skillName: weaponData.attackWith,
            skillBaseAttribute: skillData.baseAttribute,
            skillValue: skillData.value,
            unskilledUse: skillData.unskilledUse,
            strengthValue: this.actor.data.data.attributes.strength,
            charismaValue: this.actor.data.data.attributes.charisma,
            dexterityValue: this.actor.data.data.attributes.dexterity,
            mindValue: this.actor.data.data.attributes.mind,
            spiritValue: this.actor.data.data.attributes.spirit,
            possibilityTotal: 0,
            upTotal: 0,
            heroTotal: 0,
            dramaTotal: 0,
            cardsPlayed: 0,
            weaponName: item.data.name,
            weaponDamageType: weaponData.damageType,
            weaponDamage: weaponData.damage,
            damage: weaponData.damage,
            weaponAP: weaponData.ap,
            targetToughness: targetToughness,
            targetArmor: targetArmor,
            targetType: targetType,
            woundModifier: parseInt(-(this.actor.data.data.wounds.value)),
            stymiedModifier: parseInt(this.actor.data.data.stymiedModifier),
            darknessModifier: parseInt(this.actor.data.data.darknessModifier),
            sizeModifier: sizeModifier,
            vulnerableModifier: vulnerableModifier,
            vitalAreaDamageModifier: 0,
            chatNote: weaponData.chatNote,
            defaultDodge: defaultDodge,
            defaultMelee: defaultMelee,
            defaultUnarmed: defaultUnarmed,
            targetDodge: targetDodge,
            targetMelee: targetMelee,
            targetUnarmed: targetUnarmed,
            disfavored: false

        }

        if (event.shiftKey) {
            let testDialog = new attackDialog(test);
            testDialog.render(true);
        } else {
            torgchecks.weaponAttack(test)
        }

    };

    _onBonusRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemID);

        item.bonus();
    }

    _onPowerRoll(event) {
        const itemID = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemID);
        var powerData = item.data.data;
        var skillData = this.actor.data.data.skills[powerData.skill];

        let test = {
            testType: "power",
            actor: this.actor,
            actorPic: this.actor.data.img,
            actorType: this.actor.data.type,
            item: item,
            skillName: skillData.name,
            skillBaseAttribute: skillData.baseattribute,
            skillAdds: skillData.adds,
            skillValue: skillData.value,
            strengthValue: 0, // not sure what this is?
            powerName: item.data.name,
            powerAttack: powerData.isAttack,
            damage: powerData.damage,
            unskilledUse: event.currentTarget.dataset.unskilleduse,
            woundModifier: parseInt(-(this.actor.data.data.wounds.value)),
            stymiedModifier: parseInt(this.actor.data.data.stymiedModifier),
            darknessModifier: parseInt(this.actor.data.data.darknessModifier),
            type: event.currentTarget.dataset.testtype,
            possibilityTotal: 0,
            upTotal: 0,
            heroTotal: 0,
            dramaTotal: 0,
            cardsPlayed: 0,
            sizeModifier: 0,
            vulnerableModifier: 0,
            disfavored: false
        }
        if (event.shiftKey) {
            let testDialog = new skillDialog(test);
            testDialog.render(true);
        } else {
            torgchecks.powerRoll(test);
        }
    }

    _onCreateSa(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability"
        };
        return this.actor.createEmbeddedDocuments("Item", [itemData], {
            renderSheet: true
        });
    }

    _onCreateSaR(event) {
        event.preventDefault();
        let itemData = {
            name: "Name",
            type: "specialability-rollable"
        };
        return this.actor.createEmbeddedDocuments("Item", [itemData], {
            renderSheet: true
        });
    }



    _onItemEquip(event) {
        var actor = this.actor;
        const itemID = event.currentTarget.closest(".item").getAttribute("data-item-id");
        const item = this.actor.items.get(itemID);
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


    //------CARDS----

    //---general animations
    _displayCard(hand) {

        for (let i = 0; i < hand.children.length; i++) {
            if (!hand.children[i].classList.contains("focusedCard")) {


                hand.children[i].style.transformOrigin = "50% 150%";
                hand.children[i].style.transform = `rotateZ(${i * 10}deg)`;
            }
        }
        hand.style.transform = `rotateZ(${hand.children.length * -5}deg)`

    }

    _onCardReserve(event) {
        const cardID = event.currentTarget.closest(".card").getAttribute("data-item-id");
        const card = this.actor.items.get(cardID);
        if (card.data.data.reserved === false) {
            card.data.data.reserved = true;
            card.update({
                "data.reserved": true
            });
            game.socket.emit("system.torgeternity", {
                msg: "cardReserved",
                data: {
                    player: game.user.data._id,
                    card: card
                }
            });
        } else {
            card.data.data.reserved = false;
            card.update({
                "data.reserved": false
            });
            game.socket.emit("system.torgeternity", {
                msg: "cardReserved",
                data: {
                    player: game.user.data._id,
                    card: card
                }
            });
        }

    }
    _onCardExchange(event) {
        /*
                let applyChanges = false;
                new Dialog({
                    title: "card exchange proposal",
                    content: "",
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
        */
    }

    _onCardPlay(event) {

        const cardID = event.currentTarget.closest(".card").getAttribute("data-item-id");
        const card = this.actor.items.get(cardID);
        if (game.combat === null || card.data.type == "cosm") {
            card.roll();
            this.actor.deleteOwnedItem(cardID);
            game.socket.emit("system.torgeternity", {
                msg: "cardPlayed",
                data: {
                    player: game.user.data._id,
                    card: card
                }
            });
        } else {
            if (!card.data.data.reserved) {
                ui.notifications.warn(game.i18n.localize('torgeternity.notifications.onlyReservedCard'));
            } else {
                card.roll();
                this.actor.deleteOwnedItem(cardID);
                game.socket.emit("system.torgeternity", {
                    msg: "cardPlayed",
                    data: {
                        player: game.user.data._id,
                        card: card
                    }
                });
            }
        }

    }
}