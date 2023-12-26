import { getTorgValue } from "./torgchecks.js";

export default class torgeternityActor extends Actor {
  prepareBaseData() {
    //Here Effects are not yet applied
    //Set Values for All Characters

    if ((this._source.type === "stormknight") | (this._source.type === "threat")) {
      // Base Fatigue
      this.system.other.fatigue = 2;

      if (this.system.other.possibilities === false) {
        //Set Possiblities to 3, as this is most likely the value a Storm Knight starts with
        if (this._source.type === "stormknight") this.system.other.possibilities = 3;
        else this.system.other.possibilities = 0;
      }
    }

    // Other derived attributes for Storm Knights
    if (this._source.type === "stormknight") {
      mergeObject(
        this.prototypeToken,
        {
          actorLink: true,
          disposition: 1,
        },
        { overwrite: true }
      );

      // Set base wounds to 3
      this.system.wounds.max = 3;
      //Set base shock to Spirit
      this.system.shock.max = this.system.attributes.spirit;
      //Set base armor to zero
      this.system.other.armor = 0;
      //Set base toughness
      this.system.other.toughness = parseInt(this.system.attributes.strength) + parseInt(this.system.other.armor);

      //Set axioms based on home reality
      let magicAxiom = this.system.axioms.magic;
      let socialAxiom = this.system.axioms.social;
      let spiritAxiom = this.system.axioms.spirit;
      let techAxiom = this.system.axioms.tech;
      switch (this.system.other.cosm) {
        case "coreEarth":
          this.system.axioms.magic = 9;
          this.system.axioms.social = 23;
          this.system.axioms.spirit = 10;
          this.system.axioms.tech = 23;
          break;
        case "aysle":
          this.system.axioms.magic = 24;
          this.system.axioms.social = 16;
          this.system.axioms.spirit = 18;
          this.system.axioms.tech = 14;
          break;
        case "cyberpapacy":
          this.system.axioms.magic = 14;
          this.system.axioms.social = 18;
          this.system.axioms.spirit = 16;
          this.system.axioms.tech = 26;
          break;
        case "livingLand":
          this.system.axioms.magic = 1;
          this.system.axioms.social = 7;
          this.system.axioms.spirit = 24;
          this.system.axioms.tech = 6;
          break;
        case "nileEmpire":
          this.system.axioms.magic = 14;
          this.system.axioms.social = 20;
          this.system.axioms.spirit = 18;
          this.system.axioms.tech = 20;
          break;
        case "orrorsh":
          this.system.axioms.magic = 16;
          this.system.axioms.social = 18;
          this.system.axioms.spirit = 16;
          this.system.axioms.tech = 18;
          break;
        case "panPacifica":
          this.system.axioms.magic = 4;
          this.system.axioms.social = 24;
          this.system.axioms.spirit = 8;
          this.system.axioms.tech = 24;
          break;
        case "tharkold":
          this.system.axioms.magic = 12;
          this.system.axioms.social = 25;
          this.system.axioms.spirit = 4;
          this.system.axioms.tech = 25;
          break;
        case "other":
        default:
          this.system.axioms.magic = magicAxiom;
          this.system.axioms.social = socialAxiom;
          this.system.axioms.spirit = spiritAxiom;
          this.system.axioms.tech = techAxiom;
          break;
      }

      //Set clearance level
      if (this.system.xp.earned < 50) {
        this.system.details.clearance = "alpha";
      } else if (this.system.xp.earned < 200) {
        this.system.details.clearance = "beta";
      } else if (this.system.xp.earned < 500) {
        this.system.details.clearance = "gamma";
      } else if (this.system.xp.earned < 1000) {
        this.system.details.clearance = "delta";
      } else {
        this.system.details.clearance = "omega";
      }

      //Set armor and shield toggle states
      var i;
      for (i = 0; i < this.items.length; i++) {
        var item = this.items[i];
        if (item.type === "shield") {
          if (item.system.equipped === true) {
            this.items[i].system.equippedClass = "item-equipped";
          } else {
            this.items[i].system.equippedClass = "item-unequipped";
          }
        }
        if (item.type === "armor") {
          if (item.system.equipped === true) {
            this.items[i].system.equippedClass = "item-equipped";
          } else {
            this.items[i].system.equippedClass = "item-unequipped";
          }
        }
      }
    }

    //Set derived values for vehicles
    if (this._source.type === "vehicle") {
      var convertedPrice = 0;
      switch (this.system.price.magnitude) {
        case "ones":
          convertedPrice = this.system.price.dollars;
          break;
        case "thousands":
          convertedPrice = parseInt(this.system.price.dollars * 1000);
          break;
        case "millions":
          convertedPrice = parseInt(this.system.price.dollars * 1000000);
          break;
        case "billions":
          convertedPrice = parseInt(this.system.price.dollars * 1000000000);
      }
      this.system.price.value = getTorgValue(convertedPrice);
      let speedValue = parseInt(getTorgValue(this.system.topSpeed.kph) + 2);
      this.system.topSpeed.value = speedValue;
      let speedPenalty = 0;
      if (speedValue < 11) {
        speedPenalty = 0;
      } else if (speedValue < 15) {
        speedPenalty = -2;
      } else if (speedValue < 17) {
        speedPenalty = -4;
      } else {
        speedPenalty = -6;
      }
      this.system.topSpeed.penalty = speedPenalty;

      this.system.defense = parseInt(this.system.operator.skillValue + this.system.maneuver);
    }
  }

  prepareDerivedData() {
    //Here Effects are applied, whatever follow cannot be directly affected by Effects

    // Skillsets
    var skillset = this.system.skills;

    // Derive Skill values for Storm Knights
    //
    // NOTE: Threat skill values are created directly by user, but SK skill values are derived based on attribute + adds.
    //
    if (this._source.type === "stormknight") {
      for (let [name, skill] of Object.entries(skillset)) {
        if (this._source.system.skills[name].adds === null) {
          if (skill.unskilledUse === 1) {
            skill.value =
              parseInt(this.system.attributes[skill.baseAttribute]) + (skill.adds ? parseInt(skill.adds) : 0);
          } else {
            skill.value = "-";
            skill.adds = null;
          }
        } else {
          skill.value = parseInt(skill.adds) + parseInt(this.system.attributes[skill.baseAttribute]);
        }
      }
    }

    if ((this._source.type === "stormknight") | (this._source.type === "threat")) {
      //Set base unarmedDamage from interaction
      this.system.unarmedDamage = this.system.attributes.strength + (this.system?.unarmedDamageMod | 0);

      // Set Defensive Values based on modified attributes
      if (skillset.dodge.value) {
        this.system.dodgeDefense = this.system.skills.dodge.value + (this.system?.dodgeDefenseMod | 0);
      } else {
        this.system.dodgeDefense = this.system.attributes.dexterity + (this.system?.dodgeDefenseMod | 0);
      }

      if (skillset.meleeWeapons.value) {
        this.system.meleeWeaponsDefense =
          this.system.skills.meleeWeapons.value + (this.system?.meleeWeaponsDefenseMod | 0);
      } else {
        this.system.meleeWeaponsDefense = this.system.attributes.dexterity + (this.system?.meleeWeaponsDefenseMod | 0);
      }

      if (skillset.unarmedCombat.value) {
        this.system.unarmedCombatDefense =
          this.system.skills.unarmedCombat.value + (this.system?.unarmedCombatDefenseMod | 0);
      } else {
        this.system.unarmedCombatDefense =
          this.system.attributes.dexterity + (this.system?.unarmedCombatDefenseMod | 0);
      }

      if (skillset.intimidation.value) {
        this.system.intimidationDefense =
          this.system.skills.intimidation.value + (this.system?.intimidationDefenseMod | 0);
      } else {
        this.system.intimidationDefense = this.system.attributes.spirit + (this.system?.intimidationDefenseMod | 0);
      }

      if (skillset.maneuver.value) {
        this.system.maneuverDefense = this.system.skills.maneuver.value + (this.system?.maneuverDefenseMod | 0);
      } else {
        this.system.maneuverDefense = this.system.attributes.dexterity + (this.system?.maneuverDefenseMod | 0);
      }

      if (skillset.taunt.value) {
        this.system.tauntDefense = this.system.skills.taunt.value + (this.system?.tauntDefenseMod | 0);
      } else {
        this.system.tauntDefense = this.system.attributes.charisma + (this.system?.tauntDefenseMod | 0);
      }

      if (skillset.trick.value) {
        this.system.trickDefense = this.system.skills.trick.value + (this.system?.trickDefenseMod | 0);
      } else {
        this.system.trickDefense = this.system.attributes.mind + (this.system?.trickDefenseMod | 0);
      }
    }

    // Other derived attributes for Storm Knights
    if (this._source.type === "stormknight") {
      mergeObject(
        this.prototypeToken,
        {
          actorLink: true,
          disposition: 1,
        },
        { overwrite: true }
      );

      //Set base move and run
      this.system.other.move = this.system.attributes.dexterity;
      this.system.other.run = parseInt(this.system.attributes.dexterity) * 3;
      //
      //Apply the moveMod effect
      const listChanges = [];
      var computeMove = this.system.other.move;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === "system.other.moveMod") listChanges.push(k);
        })
      );
      // Modify +/-
      listChanges
        .filter((ef) => ef.mode === 2)
        .forEach((ef) => {
          computeMove += parseInt(ef.value);
        });
      // Modify x
      listChanges
        .filter((ef) => ef.mode === 1)
        .forEach((ef) => {
          computeMove = computeMove * parseInt(ef.value);
        });
      // Modify minimum
      listChanges
        .filter((ef) => ef.mode === 4)
        .forEach((ef) => {
          computeMove = Math.max(computeMove, parseInt(ef.value));
        });
      // Modify maximum
      listChanges
        .filter((ef) => ef.mode === 3)
        .forEach((ef) => {
          computeMove = Math.min(computeMove, parseInt(ef.value));
        });
      // Modify Fixed
      listChanges
        .filter((ef) => ef.mode === 5)
        .forEach((ef) => {
          computeMove = parseInt(ef.value);
        });
      this.system.other.move = computeMove;
      //
      //Apply the runMod effect
      const listRun = [];
      var computeRun = this.system.other.run;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === "system.other.runMod") listRun.push(k);
        })
      );
      // Modify +/-
      listRun
        .filter((ef) => ef.mode === 2)
        .forEach((ef) => {
          computeRun += parseInt(ef.value);
        });
      // Modify x
      listRun
        .filter((ef) => ef.mode === 1)
        .forEach((ef) => {
          computeRun = computeRun * parseInt(ef.value);
        });
      // Modify minimum
      listRun
        .filter((ef) => ef.mode === 4)
        .forEach((ef) => {
          computeRun = Math.max(computeRun, parseInt(ef.value));
        });
      // Modify maximum
      listRun
        .filter((ef) => ef.mode === 3)
        .forEach((ef) => {
          computeRun = Math.min(computeRun, parseInt(ef.value));
        });
      // Modify Fixed
      listRun
        .filter((ef) => ef.mode === 5)
        .forEach((ef) => {
          computeRun = parseInt(ef.value);
        });
      this.system.other.run = computeRun;
      //
    }
  }

  applyActiveEffects() {
    super.applyActiveEffects();

    const effects = this.effects;

    if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.veryStymied`))) {
      this.system.stymiedModifier = -4;
    } else if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.stymied`))) {
      this.system.stymiedModifier = -2;
    } else this.system.stymiedModifier = 0;

    if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.veryVulnerable`))) {
      this.system.vulnerableModifier = 4;
    } else if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.vulnerable`))) {
      this.system.vulnerableModifier = 2;
    } else this.system.vulnerableModifier = 0;

    if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.pitchBlack`))) {
      this.system.darknessModifier = -6;
    } else if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.dark`))) {
      this.system.darknessModifier = -4;
    } else if (effects.contents.find((ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.dim`))) {
      this.system.darknessModifier = -2;
    } else this.system.darknessModifier = 0;
  }

  //adding a method to get defauld stormknight cardhand
  getDefaultHand() {
    if (game.settings.get("torgeternity", "deckSetting").stormknights.hasOwnProperty(this.id)) {
      return game.cards.get(game.settings.get("torgeternity", "deckSetting").stormknights[this.id]);
    } else {
      console.error(`
            no default hand for actor : ${this.name}`);
      return false;
    }
  }

  async createDefaultHand() {
    // creating a card hand then render it
    let cardData = {
      name: this.name,
      type: "hand",
      ownership: this.getHandOwnership(),
    };
    let characterHand = await Cards.create(cardData);

    // getting ids of actor and card hand
    let actorId = this.id;
    let handId = characterHand.id;

    // storing ids in game.settings
    let settingData = game.settings.get("torgeternity", "deckSetting");
    settingData.stormknights[actorId] = handId;
    game.settings.set("torgeternity", "deckSetting", settingData);

    //return the hand
    return characterHand;
  }

  //return a permission update object for use with the corresponding hand - which has the same owners as the SK, the default as observer, and deletes other permissions
  getHandOwnership() {
    let handOwnership = duplicate(this.ownership);
    for (let key of Object.keys(handOwnership)) {
      //remove any permissions that are not owner
      if (handOwnership[key] < CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
        delete handOwnership[key];
      }
      //set default permission to observer
      handOwnership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    }
    return handOwnership;
  }
}
