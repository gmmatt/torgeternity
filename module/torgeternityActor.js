export default class torgeternityActor extends Actor {    


    
    prepareBaseData() {
           
        if (this.data._source.type === "stormknight") { 
          mergeObject(this.data.token, {
           
            actorLink: true,
            disposition: 1
          }, {overwrite: true});
          

            var skillset = this.data.data.skills;

            // Derive Skill values for Storm Knights
            for (let [name, skill] of Object.entries(skillset)) {
                if (skill.adds === null) {
                    if (skill.unskilledUse === 1) {
                        skill.value = parseInt(this.data.data.attributes[skill.baseAttribute]);
                    } else {
                        skill.value = "-"
                    }
                } else {
                    skill.value = parseInt(skill.adds) + parseInt(this.data.data.attributes[skill.baseAttribute]);
                }
            }
            
            // Set Defensive values for Storm Knight sheet
            if (skillset.dodge.value) {
                this.data.data.dodgeDefense = this.data.data.skills.dodge.value;
            } else {
                this.data.data.dodgeDefense = this.data.data.attributes.dexterity
            };

            if (skillset.meleeWeapons.value) {
                this.data.data.meleeWeaponsDefense = this.data.data.skills.meleeWeapons.value;
            } else {
                this.data.data.meleeWeaponsDefense = this.data.data.attributes.dexterity
            };
            
            if (skillset.unarmedCombat.value) {
            this.data.data.unarmedCombatDefense = this.data.data.skills.unarmedCombat.value;
            } else {
                this.data.data.unarmedCombatDefense = this.data.data.attributes.dexterity
            };

            if (skillset.intimidation.value) {
                this.data.data.intimidationDefense = this.data.data.skills.intimidation.value;
            } else {
                this.data.data.intimidationDefense = this.data.data.attributes.spirit
            };

            if (skillset.maneuver.value) {
                this.data.data.maneuverDefense = this.data.data.skills.maneuver.value;
            } else {
                this.data.data.maneuverDefense = this.data.data.attributes.dexterity
            };

            if (skillset.taunt.value) {
                this.data.data.tauntDefense = this.data.data.skills.taunt.value;
            } else {
                this.data.data.tauntDefense = this.data.data.attributes.charisma
            };

            if (skillset.trick.value) {
                this.data.data.trickDefense = this.data.data.skills.trick.value;
            } else {
                this.data.data.trickDefense = this.data.data.attributes.mind
            };

            // Set base wounds to 3
            this.data.data.wounds.max = 3;

            //Set base shock to Spirit
            this.data.data.shock.max = this.data.data.attributes.spirit;

            //Set base move and run
            this.data.data.other.move = this.data.data.attributes.dexterity;
            this.data.data.other.run = parseInt(this.data.data.attributes.dexterity) * 3;

            //Set base armor to zero
            this.data.data.other.armor = 0;

            //Set base toughness
            this.data.data.other.toughness = parseInt(this.data.data.attributes.strength) + parseInt(this.data.data.other.armor);

            //Set axioms based on home reality
            switch(this.data.data.other.cosm) {
                case "coreEarth":
                    this.data.data.axioms.magic = 9;
                    this.data.data.axioms.social = 23;
                    this.data.data.axioms.spirit = 10;
                    this.data.data.axioms.tech = 23;
                    break;
                case "aysle":
                    this.data.data.axioms.magic = 24;
                    this.data.data.axioms.social = 16;
                    this.data.data.axioms.spirit = 18;
                    this.data.data.axioms.tech = 14;
                    break;
                case "cyberpapacy":
                    this.data.data.axioms.magic = 15;
                    this.data.data.axioms.social = 18;
                    this.data.data.axioms.spirit = 16;
                    this.data.data.axioms.tech = 26;
                    break;
                case "livingLand":
                    this.data.data.axioms.magic = 1;
                    this.data.data.axioms.social = 7;
                    this.data.data.axioms.spirit = 24;
                    this.data.data.axioms.tech = 6;
                    break;
                case "nileEmpire":
                    this.data.data.axioms.magic = 14;
                    this.data.data.axioms.social = 20;
                    this.data.data.axioms.spirit = 18;
                    this.data.data.axioms.tech = 20;
                    break;
                case "orrorsh":
                    this.data.data.axioms.magic = 16;
                    this.data.data.axioms.social = 18;
                    this.data.data.axioms.spirit = 16;
                    this.data.data.axioms.tech = 18;
                    break;
                case "panPacifica":
                    this.data.data.axioms.magic = 4;
                    this.data.data.axioms.social = 24;
                    this.data.data.axioms.spirit = 8;
                    this.data.data.axioms.tech = 24;
                    break;
                case "tharkold":
                    this.data.data.axioms.magic = 12;
                    this.data.data.axioms.social = 25;
                    this.data.data.axioms.spirit = 4;
                    this.data.data.axioms.tech = 25;
                    break;
                default:
                    this.data.data.axioms.magic = "";
                    this.data.data.axioms.social = "";
                    this.data.data.axioms.spirit = "";
                    this.data.data.axioms.tech = "";
                    break;
            }
            
            //Set clearance level
            
            if (this.data.data.xp.earned < 50) {
                this.data.data.details.clearance = "alpha";
            } else if (this.data.data.xp.earned < 200) {
                this.data.data.details.clearance = "beta";
            } else if (this.data.data.xp.earned < 500) {
                this.data.data.details.clearance = "gamma";
            } else if (this.data.data.xp.earned < 1000) {
                this.data.data.details.clearance = "delta";
            } else {
                this.data.data.details.clearance = "omega";
            };

            //Set armor and shield toggle states
            var i;
            for (i=0; i < this.data.items.length; i++) {
                var item = this.data.items[i];
                if (item.type === "shield") {
                    if (item.data.equipped === true) {
                        this.data.items[i].data.equippedClass = "item-equipped"
                    } else {
                        this.data.items[i].data.equippedClass = "item-unequipped"
                    }
                }
                if (item.type === "armor") {
                    if (item.data.equipped === true) {
                        this.data.items[i].data.equippedClass = "item-equipped"
                    } else {
                        this.data.items[i].data.equippedClass = "item-unequipped"
                    }
                }
            }

        };

        //Set unknown edit states to none
        if (this.data.data.editstate === undefined) {
            this.data.data.editstate = "inline";
        }; 

    }

    applyActiveEffects() {
        super.applyActiveEffects();
                
        var i;
        const effects = this.data.effects
        for (i=0; i < effects.length; i++) {
            if (effects[i].flags.hasOwnProperty("core")) {
                if (effects[i].flags.core.statusId === "stymied") {
                    this.data.data.stymiedModifier = -2;
                } else if (effects[i].flags.core.statusId === "veryStymied") {
                    this.data.data.stymiedModifier = -4;
                }
                if (effects[i].flags.core.statusId === "vulnerable") {
                    this.data.data.vulnerableModifier = 2;
                } else if (effects[i].flags.core.statusId === "veryVulnerable") {
                    this.data.data.vulnerableModifier = 4
                }
            }
        }
    }


}
