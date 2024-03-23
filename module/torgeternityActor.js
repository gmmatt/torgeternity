import { getTorgValue } from "./torgchecks.js";

/**
 *
 */
export default class torgeternityActor extends Actor {
  /**
   * @inheritdoc
   */
  prepareBaseData() {
    // Here Effects are not yet applied
    // Set armor and shield toggle states
    if (this.type === "stormknight") {
      for (const item of this.itemTypes.armor) {
        item.system.equippedClass = item.system.equipped ? "item-equipped" : "item-unequipped";
      }
      for (const item of this.itemTypes.shield) {
        item.system.equippedClass = item.system.equipped ? "item-equipped" : "item-unequipped";
      }
    }

    if ((this._source.type === "stormknight") | (this._source.type === "threat")) {
      if (this.system.other.possibilities === false) {
        // Set Possiblities to 3, as this is most likely the value a Storm Knight starts with
        if (this._source.type === "stormknight") this.system.other.possibilities = 3;
        else {
          this.system.other.possibilities = 0;
          this.update({
            "prototypeToken.texture.src": "systems/torgeternity/images/icons/threat-token.webp",
            img: "systems/torgeternity/images/icons/threat.webp",
          });
        }
      }
    }

    // Set derived values for vehicles
    if (this._source.type === "vehicle") {
      if (this.img.includes("mystery-man")) {
        this.update({
          "prototypeToken.texture.src": "systems/torgeternity/images/icons/vehicle-Token.webp",
          img: "systems/torgeternity/images/icons/vehicle.webp",
        });
      }
      let convertedPrice = 0;
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
      const speedValue = parseInt(getTorgValue(this.system.topSpeed.kph) + 2);
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
    // initialize the worn armor bonus
    this.system.other.armor = this.wornArmor?.system?.bonus || 0;
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    // Here Effects are applied, whatever follow cannot be directly affected by Effects

    // Skillsets
    if (["threat", "stormknight"].includes(this.type)) {
      // Set base unarmedDamage from interaction
      const unarmedDamageMod = this.system.unarmedDamageMod || 0;
      this.system.unarmedDamage = this.attributes.strength + unarmedDamageMod;

      // Set Defensive Values based on modified this.attributes
      const dodgeDefenseMod = this.system.dodgeDefenseMod || 0;
      const dodgeDefenseSkill = this.skills.dodge.value || this.attributes.dexterity;
      this.system.dodgeDefense = dodgeDefenseSkill + dodgeDefenseMod;

      const meleeWeaponsDefenseMod = this.system.meleeWeaponsDefenseMod || 0;
      const meleeWeaponsDefenseSkill = this.skills.meleeWeapons.value || this.attributes.dexterity;
      this.system.meleeWeaponsDefense = meleeWeaponsDefenseSkill + meleeWeaponsDefenseMod;

      const unarmedCombatDefenseMod = this.system.unarmedCombatDefenseMod || 0;
      const unarmedCombatDefenseSkill = this.skills.unarmedCombat.value || this.attributes.dexterity;
      this.system.unarmedCombatDefense = unarmedCombatDefenseSkill + unarmedCombatDefenseMod;

      const intimidationDefenseMod = this.system.intimidationDefenseMod || 0;
      const intimidationDefenseSkill = this.skills.intimidation.value || this.attributes.spirit;
      this.system.intimidationDefense = intimidationDefenseSkill + intimidationDefenseMod;

      const maneuverDefenseMod = this.system.maneuverDefenseMod || 0;
      const maneuverDefenseSkill = this.skills.maneuver.value || this.attributes.dexterity;
      this.system.maneuverDefense = maneuverDefenseSkill + maneuverDefenseMod;

      const tauntDefenseMod = this.system.tauntDefenseMod || 0;
      const tauntDefenseSkill = this.skills.taunt.value || this.attributes.charisma;
      this.system.tauntDefense = tauntDefenseSkill + tauntDefenseMod;

      const trickDefenseMod = this.system.trickDefenseMod || 0;
      const trickDefenseSkill = this.skills.trick.value || this.attributes.mind;
      this.system.trickDefense = trickDefenseSkill + trickDefenseMod;

      // Other derived attributes for Storm Knights

      // Apply the moveMod effect
      const listMove = [];
      let computeMove = this.system.other.move;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === "system.other.moveMod") {
            listMove.push(k);
          }
        })
      );
      // Modify x
      listMove
        .filter((ef) => ef.mode === 1)
        .forEach((ef) => {
          computeMove = computeMove * parseInt(ef.value);
        });
      // Modify +/-
      listMove
        .filter((ef) => ef.mode === 2)
        .forEach((ef) => {
          computeMove += parseInt(ef.value);
        });
      // Modify minimum
      listMove
        .filter((ef) => ef.mode === 4)
        .forEach((ef) => {
          computeMove = Math.max(computeMove, parseInt(ef.value));
        });
      // Modify maximum
      listMove
        .filter((ef) => ef.mode === 3)
        .forEach((ef) => {
          computeMove = Math.min(computeMove, parseInt(ef.value));
        });
      // Modify Fixed
      listMove
        .filter((ef) => ef.mode === 5)
        .forEach((ef) => {
          computeMove = parseInt(ef.value);
        });
      this.system.other.move = computeMove;
      //
      // Apply the runMod effect
      const listRun = [];
      let computeRun = this.system.other.run;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === "system.other.runMod") {
            listRun.push(k);
          }
        })
      );
      // Modify x
      listRun
        .filter((ef) => ef.mode === 1)
        .forEach((ef) => {
          computeRun = computeRun * parseInt(ef.value);
        });
      // Modify +/-
      listRun
        .filter((ef) => ef.mode === 2)
        .forEach((ef) => {
          computeRun += parseInt(ef.value);
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
    if (game.user.isGM) {
      const malus = this.effects.find((ef) => ef.name === "Malus");
      if (malus?.disabled) {
        try {
          malus.delete();
        } catch (e) {}
      }
    }
  }

  /**
   *
   */
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

  /**
   * simple getter for the equipped armor item
   *
   * @returns {Item|null}
   */
  get wornArmor() {
    return this.itemTypes.armor.find((a) => a.equipped) ?? null;
  }

  // adding a method to get defauld stormknight cardhand
  /**
   *
   */
  getDefaultHand() {
    if (game.settings.get("torgeternity", "deckSetting").stormknights.hasOwnProperty(this.id)) {
      return game.cards.get(game.settings.get("torgeternity", "deckSetting").stormknights[this.id]);
    } else {
      console.error(`
            no default hand for actor : ${this.name}`);
      return false;
    }
  }

  /**
   *
   */
  async createDefaultHand() {
    // creating a card hand then render it
    const cardData = {
      name: this.name,
      type: "hand",
      ownership: this.getHandOwnership(),
    };
    const characterHand = await Cards.create(cardData);

    // getting ids of actor and card hand
    const actorId = this.id;
    const handId = characterHand.id;

    // storing ids in game.settings
    const settingData = game.settings.get("torgeternity", "deckSetting");
    settingData.stormknights[actorId] = handId;
    game.settings.set("torgeternity", "deckSetting", settingData);

    // return the hand
    return characterHand;
  }

  // return a permission update object for use with the corresponding hand - which has the same owners as the SK, the default as observer, and deletes other permissions
  /**
   *
   */
  getHandOwnership() {
    const handOwnership = duplicate(this.ownership);
    for (const key of Object.keys(handOwnership)) {
      // remove any permissions that are not owner
      if (handOwnership[key] < CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
        delete handOwnership[key];
      }
      // set default permission to observer
      handOwnership.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
    }
    return handOwnership;
  }
}
