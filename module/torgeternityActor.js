export default class torgeternityActor extends Actor {
    prepareBaseData() {
        

        
        if (this._data.type === "stormknight") {        
            var skillset = this.data.data.skills;
            // Set base attributes - because the defaults from template.json aren't showing up on all skills (not sure why)

            skillset.airVehicles.baseAttribute = "dexterity";
            skillset.alteration.baseAttribute = "mind";
            skillset.apportation.baseAttribute = "spirit";
            skillset.beastRiding.baseAttribute = "dexterity";
            skillset.computers.baseAttribute = "mind";
            skillset.conjuration.baseAttribute = "spirit";
            skillset.divination.baseAttribute = "mind";
            skillset.dodge.baseAttribute = "dexterity";
            skillset.energyWeapons.baseAttribute = "dexterity";
            skillset.evidenceAnalysis.baseAttribute = "mind";
            skillset.faith.baseAttribute = "spirit";
            skillset.find.baseAttribute = "mind";
            skillset.fireCombat.baseAttribute = "dexterity";
            skillset.firstAid.baseAttribute = "mind";
            skillset.heavyWeapons.baseAttribute = "dexterity";
            skillset.intimidation.baseAttribute = "spirit";
            skillset.kinesis.baseAttribute = "spirit";
            skillset.landVehicles.baseAttribute = "dexterity";
            skillset.language.baseAttribute = "mind";
            skillset.lockpicking.baseAttribute = "dexterity";
            skillset.maneuver.baseAttribute = "dexterity";
            skillset.medicine.baseAttribute = "mind";
            skillset.meleeWeapons.baseAttribute = "dexterity";
            skillset.missileWeapons.baseAttribute = "dexterity";
            skillset.persuasion.baseAttribute = "charisma";
            skillset.precognition.baseAttribute = "mind";
            skillset.profession.baseAttribute = "mind";
            skillset.reality.baseAttribute = "spirit";
            skillset.scholar.baseAttribute = "mind";
            skillset.science.baseAttribute = "mind";
            skillset.stealth.baseAttribute = "dexterity";
            skillset.streetwise.baseAttribute = "charisma";
            skillset.survival.baseAttribute = "mind";
            skillset.taunt.baseAttribute = "charisma";
            skillset.telepathy.baseAttribute = "charisma";
            skillset.tracking.baseAttribute = "mind";
            skillset.trick.baseAttribute = "mind";
            skillset.unarmedCombat.baseAttribute = "dexterity";
            skillset.waterVehicles.baseAttribute = "dexterity";
            skillset.willpower.baseAttribute = "spirit";

            // Derive Skill values for Storm Knights
            for (let [name, skill] of Object.entries(skillset)) {
                skill.value = parseInt(skill.adds) + parseInt(this.data.data.attributes[skill.baseAttribute]);
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
            this.data.data.editstate = "none";
        }; 

    }
}
