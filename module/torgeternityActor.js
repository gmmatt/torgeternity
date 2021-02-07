export default class torgeternityActor extends Actor {
    prepareBaseData() {
        

        
        if (this._data.type === "stormknight") {        
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

        };

        //Set unknown edit states to none
        if (this.data.data.editstate === undefined) {
            this.data.data.editstate = "inline";
        }; 

    }

    applyActiveEffects() {
        var i
        const effects = this.data.effects
        for (i=0; i < effects.length; i++) {
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
