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
            html.find(".skill-toggle").click(this._onSkillToggle.bind(this));
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

    _onSkillToggle(event) {
        var firstItem = 0
        var toggleState = document.getElementById("skillToggle").dataset.state;
        event.preventDefault();

        // First toggle the state of the skills display full/limited
        
        if (toggleState === "limited") {
            toggleState = "full";
            document.getElementById("skillToggle").dataset.state = "full";
            document.getElementById("airVehicles").style.display = "inline";
            document.getElementById("alteration-comma").style.display = "inline";
            document.getElementById("alteration").style.display = "inline";
            document.getElementById("apportation").style.display = "inline";
            document.getElementById("apportation-comma").style.display = "inline"
            document.getElementById("beastRiding").style.display = "inline";
            document.getElementById("beastRiding-comma").style.display = "inline"
            document.getElementById("computers").style.display = "inline";
            document.getElementById("computers-comma").style.display = "inline"
            document.getElementById("conjuration").style.display = "inline";
            document.getElementById("conjuration-comma").style.display = "inline"
            document.getElementById("divination").style.display = "inline";
            document.getElementById("divination-comma").style.display = "inline"
            document.getElementById("dodge").style.display = "inline";
            document.getElementById("dodge-comma").style.display = "inline"
            document.getElementById("energyWeapons").style.display = "inline";
            document.getElementById("energyWeapons-comma").style.display = "inline"
            document.getElementById("evidenceAnalysis").style.display = "inline";
            document.getElementById("evidenceAnalysis-comma").style.display = "inline"
            document.getElementById("faith").style.display = "inline";
            document.getElementById("faith-comma").style.display = "inline"
            document.getElementById("find").style.display = "inline";
            document.getElementById("find-comma").style.display = "inline"
            document.getElementById("fireCombat").style.display = "inline";
            document.getElementById("fireCombat-comma").style.display = "inline"
            document.getElementById("firstAid").style.display = "inline";
            document.getElementById("firstAid-comma").style.display = "inline"
            document.getElementById("heavyWeapons").style.display = "inline";
            document.getElementById("heavyWeapons-comma").style.display = "inline"
            document.getElementById("intimidation").style.display = "inline";
            document.getElementById("intimidation-comma").style.display = "inline"
            document.getElementById("kinesis").style.display = "inline";
            document.getElementById("kinesis-comma").style.display = "inline"
            document.getElementById("landVehicles").style.display = "inline";
            document.getElementById("landVehicles-comma").style.display = "inline"
            document.getElementById("language").style.display = "inline";
            document.getElementById("language-comma").style.display = "inline"
            document.getElementById("lockpicking").style.display = "inline";
            document.getElementById("lockpicking-comma").style.display = "inline"
            document.getElementById("maneuver").style.display = "inline";
            document.getElementById("maneuver-comma").style.display = "inline"
            document.getElementById("medicine").style.display = "inline";
            document.getElementById("medicine-comma").style.display = "inline"
            document.getElementById("meleeWeapons").style.display = "inline";
            document.getElementById("meleeWeapons-comma").style.display = "inline"
            document.getElementById("missileWeapons").style.display = "inline";
            document.getElementById("missileWeapons-comma").style.display = "inline"
            document.getElementById("persuasion").style.display = "inline";
            document.getElementById("persuasion-comma").style.display = "inline"
            document.getElementById("precognition").style.display = "inline";
            document.getElementById("precognition-comma").style.display = "inline"
            document.getElementById("profession").style.display = "inline";
            document.getElementById("profession-comma").style.display = "inline"
            document.getElementById("reality").style.display = "inline";
            document.getElementById("reality-comma").style.display = "inline"
            document.getElementById("scholar").style.display = "inline";
            document.getElementById("scholar-comma").style.display = "inline"
            document.getElementById("science").style.display = "inline";
            document.getElementById("science-comma").style.display = "inline"
            document.getElementById("stealth").style.display = "inline";
            document.getElementById("stealth-comma").style.display = "inline"
            document.getElementById("streetwise").style.display = "inline";
            document.getElementById("streetwise-comma").style.display = "inline"
            document.getElementById("survival").style.display = "inline";
            document.getElementById("survival-comma").style.display = "inline"
            document.getElementById("taunt").style.display = "inline";
            document.getElementById("taunt-comma").style.display = "inline"
            document.getElementById("telepathy").style.display = "inline";
            document.getElementById("telepathy-comma").style.display = "inline"
            document.getElementById("tracking").style.display = "inline";
            document.getElementById("tracking-comma").style.display = "inline"
            document.getElementById("trick").style.display = "inline";
            document.getElementById("trick-comma").style.display = "inline"
            document.getElementById("unarmedCombat").style.display = "inline";
            document.getElementById("unarmedCombat-comma").style.display = "inline"
            document.getElementById("waterVehicles").style.display = "inline";
            document.getElementById("waterVehicles-comma").style.display = "inline"
            document.getElementById("willpower").style.display = "inline";
            document.getElementById("willpower-comma").style.display = "inline"

        } else {
            toggleState = "limited";
            document.getElementById("skillToggle").dataset.state = "limited";
            
            if (this.actor.data.data.skills.airVehicles.value === null) {
                document.getElementById("airVehicles").style.display = "none"
            } else {
                document.getElementById("airVehicles").style.display = "inline";
                firstItem = 1;
            }

           if (this.actor.data.data.skills.alteration.value === null) {
               document.getElementById("alteration").style.display = "none";
               document.getElementById("alteration-comma").style.display = "none";
            } else {
                document.getElementById("alteration").style.display = "inline";
                if (firstItem === 1) {
                   document.getElementById("alteration-comma").style.display = "inline";
                } else {
                   document.getElementById("alteration-comma").style.display = "none";
                   firstItem = 1;
                }
           }

           if (this.actor.data.data.skills.apportation.value === null) {
            document.getElementById("apportation").style.display = "none";
            document.getElementById("apportation-comma").style.display = "none";
            } else {
             document.getElementById("apportation").style.display = "inline";
                if (firstItem === 1) {
                    document.getElementById("apportation-comma").style.display = "inline";
                } else {
                    document.getElementById("apportation-comma").style.display = "none";
                    firstItem = 1;
                }
            }

            if (this.actor.data.data.skills.beastRiding.value === null) {
                document.getElementById("beastRiding").style.display = "none";
                document.getElementById("beastRiding-comma").style.display = "none";
                } else {
                 document.getElementById("beastRiding").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("beastRiding-comma").style.display = "inline";
                    } else {
                        document.getElementById("beastRiding-comma").style.display = "none";
                        firstItem = 1;
                    }
                }

            if (this.actor.data.data.skills.computers.value === null) {
                document.getElementById("computers").style.display = "none";
                document.getElementById("computers-comma").style.display = "none";
                } else {
                 document.getElementById("computers").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("computers-comma").style.display = "inline";
                    } else {
                        document.getElementById("computers-comma").style.display = "none";
                        firstItem = 1;
                    }
                }

            if (this.actor.data.data.skills.conjuration.value === null) {
                document.getElementById("conjuration").style.display = "none";
                document.getElementById("conjuration-comma").style.display = "none";
                } else {
                 document.getElementById("conjuration").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("conjuration-comma").style.display = "inline";
                    } else {
                        document.getElementById("conjuration-comma").style.display = "none";
                        firstItem = 1;
                    }
                }

            if (this.actor.data.data.skills.divination.value === null) {
                document.getElementById("divination").style.display = "none";
                document.getElementById("divination-comma").style.display = "none";
                } else {
                    document.getElementById("divination").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("divination-comma").style.display = "inline";
                    } else {
                        document.getElementById("divination-comma").style.display = "none";
                        firstItem = 1;
                    }
                }

            if (this.actor.data.data.skills.dodge.value === null) {
                document.getElementById("dodge").style.display = "none";
                document.getElementById("dodge-comma").style.display = "none";
                } else {
                    document.getElementById("dodge").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("dodge-comma").style.display = "inline";
                    } else {
                        document.getElementById("dodge-comma").style.display = "none";
                        firstItem = 1;
                    }
                }

            if (this.actor.data.data.skills.energyWeapons.value === null) {
                document.getElementById("energyWeapons").style.display = "none";
                document.getElementById("energyWeapons-comma").style.display = "none";
                } else {
                    document.getElementById("energyWeapons").style.display = "inline";
                    if (firstItem === 1) {
                        document.getElementById("energyWeapons-comma").style.display = "inline";
                    } else {
                        document.getElementById("energyWeapons-comma").style.display = "none";
                        firstItem = 1;
                    }
                }
    
                if (this.actor.data.data.skills.evidenceAnalysis.value === null) {
                    document.getElementById("evidenceAnalysis").style.display = "none";
                    document.getElementById("evidenceAnalysis-comma").style.display = "none";
                    } else {
                     document.getElementById("evidenceAnalysis").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("evidenceAnalysis-comma").style.display = "inline";
                        } else {
                            document.getElementById("evidenceAnalysis-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
    
                if (this.actor.data.data.skills.faith.value === null) {
                    document.getElementById("faith").style.display = "none";
                    document.getElementById("faith-comma").style.display = "none";
                    } else {
                        document.getElementById("faith").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("faith-comma").style.display = "inline";
                        } else {
                            document.getElementById("faith-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.find.value === null) {
                    document.getElementById("find").style.display = "none";
                    document.getElementById("find-comma").style.display = "none";
                    } else {
                        document.getElementById("find").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("find-comma").style.display = "inline";
                        } else {
                            document.getElementById("find-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
        
                if (this.actor.data.data.skills.fireCombat.value === null) {
                    document.getElementById("fireCombat").style.display = "none";
                    document.getElementById("fireCombat-comma").style.display = "none";
                    } else {
                        document.getElementById("fireCombat").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("fireCombat-comma").style.display = "inline";
                        } else {
                            document.getElementById("fireCombat-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.firstAid.value === null) {
                    document.getElementById("firstAid").style.display = "none";
                    document.getElementById("firstAid-comma").style.display = "none";
                    } else {
                        document.getElementById("firstAid").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("firstAid-comma").style.display = "inline";
                        } else {
                            document.getElementById("firstAid-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.heavyWeapons.value === null) {
                    document.getElementById("heavyWeapons").style.display = "none";
                    document.getElementById("heavyWeapons-comma").style.display = "none";
                    } else {
                        document.getElementById("heavyWeapons").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("heavyWeapons-comma").style.display = "inline";
                        } else {
                            document.getElementById("heavyWeapons-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.intimidation.value === null) {
                    document.getElementById("intimidation").style.display = "none";
                    document.getElementById("intimidation-comma").style.display = "none";
                    } else {
                        document.getElementById("intimidation").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("intimidation-comma").style.display = "inline";
                        } else {
                            document.getElementById("intimidation-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.kinesis.value === null) {
                    document.getElementById("kinesis").style.display = "none";
                    document.getElementById("kinesis-comma").style.display = "none";
                    } else {
                        document.getElementById("kinesis").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("kinesis-comma").style.display = "inline";
                        } else {
                            document.getElementById("kinesis-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.landVehicles.value === null) {
                    document.getElementById("landVehicles").style.display = "none";
                    document.getElementById("landVehicles-comma").style.display = "none";
                    } else {
                        document.getElementById("landVehicles").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("landVehicles-comma").style.display = "inline";
                        } else {
                            document.getElementById("landVehicles-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
        
                if (this.actor.data.data.skills.language.value === null) {
                    document.getElementById("language").style.display = "none";
                    document.getElementById("language-comma").style.display = "none";
                    } else {
                        document.getElementById("language").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("language-comma").style.display = "inline";
                        } else {
                            document.getElementById("language-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.lockpicking.value === null) {
                    document.getElementById("lockpicking").style.display = "none";
                    document.getElementById("lockpicking-comma").style.display = "none";
                    } else {
                        document.getElementById("lockpicking").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("lockpicking-comma").style.display = "inline";
                        } else {
                            document.getElementById("lockpicking-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
        
                if (this.actor.data.data.skills.maneuver.value === null) {
                    document.getElementById("maneuver").style.display = "none";
                    document.getElementById("maneuver-comma").style.display = "none";
                    } else {
                        document.getElementById("maneuver").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("maneuver-comma").style.display = "inline";
                        } else {
                            document.getElementById("maneuver-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.medicine.value === null) {
                    document.getElementById("medicine").style.display = "none";
                    document.getElementById("medicine-comma").style.display = "none";
                    } else {
                        document.getElementById("medicine").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("medicine-comma").style.display = "inline";
                        } else {
                            document.getElementById("medicine-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.meleeWeapons.value === null) {
                    document.getElementById("meleeWeapons").style.display = "none";
                    document.getElementById("meleeWeapons-comma").style.display = "none";
                    } else {
                        document.getElementById("meleeWeapons").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("meleeWeapons-comma").style.display = "inline";
                        } else {
                            document.getElementById("meleeWeapons-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.missileWeapons.value === null) {
                    document.getElementById("missileWeapons").style.display = "none";
                    document.getElementById("missileWeapons-comma").style.display = "none";
                    } else {
                        document.getElementById("missileWeapons").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("missileWeapons-comma").style.display = "inline";
                        } else {
                            document.getElementById("missileWeapons-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.persuasion.value === null) {
                    document.getElementById("persuasion").style.display = "none";
                    document.getElementById("persuasion-comma").style.display = "none";
                    } else {
                        document.getElementById("persuasion").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("persuasion-comma").style.display = "inline";
                        } else {
                            document.getElementById("persuasion-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.precognition.value === null) {
                    document.getElementById("precognition").style.display = "none";
                    document.getElementById("precognition-comma").style.display = "none";
                    } else {
                        document.getElementById("precognition").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("precognition-comma").style.display = "inline";
                        } else {
                            document.getElementById("precognition-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.profession.value === null) {
                    document.getElementById("profession").style.display = "none";
                    document.getElementById("profession-comma").style.display = "none";
                    } else {
                        document.getElementById("profession").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("profession-comma").style.display = "inline";
                        } else {
                            document.getElementById("profession-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.reality.value === null) {
                    document.getElementById("reality").style.display = "none";
                    document.getElementById("reality-comma").style.display = "none";
                    } else {
                        document.getElementById("reality").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("reality-comma").style.display = "inline";
                        } else {
                            document.getElementById("reality-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.scholar.value === null) {
                    document.getElementById("scholar").style.display = "none";
                    document.getElementById("scholar-comma").style.display = "none";
                    } else {
                        document.getElementById("scholar").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("scholar-comma").style.display = "inline";
                        } else {
                            document.getElementById("scholar-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
                            
                if (this.actor.data.data.skills.science.value === null) {
                    document.getElementById("science").style.display = "none";
                    document.getElementById("science-comma").style.display = "none";
                    } else {
                        document.getElementById("science").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("science-comma").style.display = "inline";
                        } else {
                            document.getElementById("science-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.stealth.value === null) {
                    document.getElementById("stealth").style.display = "none";
                    document.getElementById("stealth-comma").style.display = "none";
                    } else {
                        document.getElementById("stealth").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("stealth-comma").style.display = "inline";
                        } else {
                            document.getElementById("stealth-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.streetwise.value === null) {
                    document.getElementById("streetwise").style.display = "none";
                    document.getElementById("streetwise-comma").style.display = "none";
                    } else {
                        document.getElementById("streetwise").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("streetwise-comma").style.display = "inline";
                        } else {
                            document.getElementById("streetwise-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.survival.value === null) {
                    document.getElementById("survival").style.display = "none";
                    document.getElementById("survival-comma").style.display = "none";
                    } else {
                        document.getElementById("survival").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("survival-comma").style.display = "inline";
                        } else {
                            document.getElementById("survival-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
                            
                if (this.actor.data.data.skills.taunt.value === null) {
                    document.getElementById("taunt").style.display = "none";
                    document.getElementById("taunt-comma").style.display = "none";
                    } else {
                        document.getElementById("taunt").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("taunt-comma").style.display = "inline";
                        } else {
                            document.getElementById("taunt-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
        
                if (this.actor.data.data.skills.telepathy.value === null) {
                    document.getElementById("telepathy").style.display = "none";
                    document.getElementById("telepathy-comma").style.display = "none";
                    } else {
                        document.getElementById("telepathy").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("telepathy-comma").style.display = "inline";
                        } else {
                            document.getElementById("telepathy-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.tracking.value === null) {
                    document.getElementById("tracking").style.display = "none";
                    document.getElementById("tracking-comma").style.display = "none";
                    } else {
                        document.getElementById("tracking").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("tracking-comma").style.display = "inline";
                        } else {
                            document.getElementById("tracking-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.trick.value === null) {
                    document.getElementById("trick").style.display = "none";
                    document.getElementById("trick-comma").style.display = "none";
                    } else {
                        document.getElementById("trick").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("trick-comma").style.display = "inline";
                        } else {
                            document.getElementById("trick-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.unarmedCombat.value === null) {
                    document.getElementById("unarmedCombat").style.display = "none";
                    document.getElementById("unarmedCombat-comma").style.display = "none";
                    } else {
                        document.getElementById("unarmedCombat").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("unarmedCombat-comma").style.display = "inline";
                        } else {
                            document.getElementById("unarmedCombat-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.waterVehicles.value === null) {
                    document.getElementById("waterVehicles").style.display = "none";
                    document.getElementById("waterVehicles-comma").style.display = "none";
                    } else {
                        document.getElementById("waterVehicles").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("waterVehicles-comma").style.display = "inline";
                        } else {
                            document.getElementById("waterVehicles-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }

                if (this.actor.data.data.skills.willpower.value === null) {
                    document.getElementById("willpower").style.display = "none";
                    document.getElementById("willpower-comma").style.display = "none";
                    } else {
                        document.getElementById("willpower").style.display = "inline";
                        if (firstItem === 1) {
                            document.getElementById("willpower-comma").style.display = "inline";
                        } else {
                            document.getElementById("willpower-comma").style.display = "none";
                            firstItem = 1;
                        }
                    }
                            

        }
    }
}

