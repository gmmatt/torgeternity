/**
 *
 */
export default class TorgeternityActor extends Actor {
  /**
   * @inheritdoc
   */
  prepareBaseData() {
    // Here Effects are not yet applied
    if (['threat', 'stormknight'].includes(this.type)) {
      // initialize the worn armor bonus
      this.fatigue = 2 + (this.wornArmor?.system?.fatigue ?? 0);
      this.system.other.maxDex = this.wornArmor?.system?.maxDex ?? 0;
      const highestMinStrWeapons =
        Math.max(...this.equippedMelees?.map((m) => m.system.minStrength)) ?? 0;
      this.system.other.minStr = Math.max(
        this.wornArmor?.system?.minStrength ?? 0,
        highestMinStrWeapons ?? 0
      ); // TODO: If we allow more than 1 wornArmor and an array is to be expected, then we need to change that here
      this.defenses = {
        dodge: { value: 0, mod: 0 },
        meleeWeapons: { value: 0, mod: 0 },
        unarmedCombat: { value: 0, mod: 0 },
        intimidation: { value: 0, mod: 0 },
        maneuver: { value: 0, mod: 0 },
        taunt: { value: 0, mod: 0 },
        trick: { value: 0, mod: 0 },
        toughness: this.system.attributes.strength.value,
        armor: this.wornArmor?.system?.bonus ?? 0,
      };
      this.unarmed = { damage: 0, damageMod: 0 };
    }
    if (['vehicle'].includes(this.type)) {
      this.defenses = {
        toughness: this.system.toughness,
        armor: this.system.armor,
      };
    }
    this.statusModifiers = {
      stymied: 0,
      vulnerable: 0,
      darkness: 0,
    };
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    // Here Effects are applied, whatever follow cannot be directly affected by Effects

    // apply status effects
    this.statusModifiers = {
      stymied: this.statuses.has('veryStymied') ? -4 : this.statuses.has('stymied') ? -2 : 0,
      vulnerable: this.statuses.has('veryVulnerable') ? 4 : this.statuses.has('vulnerable') ? 2 : 0,
      darkness: this.statuses.has('pitchBlack')
        ? -6
        : this.statuses.has('dark')
        ? -4
        : this.statuses.has('dim')
        ? -2
        : 0,
    };

    // Skillsets
    if (['threat', 'stormknight'].includes(this.type)) {
      const skills = this.system.skills;
      const attributes = this.system.attributes;
      // by RAW, FIRST you checkout for maxDex, THEN minStr. Doing this into DerivedData means, it takes place after AE's were applied, making sure, this cannot get higher than armor's limitations.
      // only apply if a maxDex value is set
      attributes.dexterity.value =
        this.system.other.maxDex > 0
          ? Math.min(attributes.dexterity.value, this.system.other.maxDex)
          : attributes.dexterity.value;
      attributes.dexterity.value += Math.min(
        0,
        attributes.strength.value - this.system.other.minStr
      );

      // Calculate Move and Run base values
      // Derive Skill values for Storm Knights and Threats
      for (const [name, skill] of Object.entries(skills)) {
        const trained = skill.unskilledUse === 1 || this._source.system.skills[name].adds;
        skill.value = trained ? this.system.attributes[skill.baseAttribute].value + skill.adds : '';
      }

      // Set base unarmed damage

      this.unarmed.damage = attributes.strength.value + this.unarmed.damageMod;

      // claculate final toughness
      this.defenses.toughness += this.defenses.armor;

      // Set Defensive Values based on modified skills and attributes

      const dodgeDefenseSkill = skills.dodge.value || attributes.dexterity.value;
      this.defenses.dodge.value = dodgeDefenseSkill + this.defenses.dodge.mod;

      const meleeWeaponsDefenseSkill = skills.meleeWeapons.value || attributes.dexterity.value;
      this.defenses.meleeWeapons.value = meleeWeaponsDefenseSkill + this.defenses.meleeWeapons.mod;

      const unarmedCombatDefenseSkill = skills.unarmedCombat.value || attributes.dexterity.value;
      this.defenses.unarmedCombat.value =
        unarmedCombatDefenseSkill + this.defenses.unarmedCombat.mod;

      const intimidationDefenseSkill = skills.intimidation.value || attributes.spirit.value;
      this.defenses.intimidation.value = intimidationDefenseSkill + this.defenses.intimidation.mod;

      const maneuverDefenseSkill = skills.maneuver.value || attributes.dexterity.value;
      this.defenses.maneuver.value = maneuverDefenseSkill + this.defenses.maneuver.mod;

      const tauntDefenseSkill = skills.taunt.value || attributes.charisma.value;
      this.defenses.taunt.value = tauntDefenseSkill + this.defenses.taunt.mod;

      const trickDefenseSkill = skills.trick.value || attributes.mind.value;
      this.defenses.trick.value = trickDefenseSkill + this.defenses.trick.mod;

      // Apply the moveMod effect for SKs & threats
      this.system.other.move = this.system.attributes.dexterity.value;
      this.system.other.run = this.system.attributes.dexterity.value * 3;

      const listChanges = [];
      let computeMove = this.system.other.move;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === 'system.other.moveMod') listChanges.push(k);
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
          computeMove = parseInt(computeMove * ef.value);
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
      // Apply the runMod effect
      const listRun = [];
      let computeRun = this.system.other.run;
      this.appliedEffects.forEach((ef) =>
        ef.changes.forEach((k) => {
          if (k.key === 'system.other.runMod') listRun.push(k);
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
          computeRun = parseInt(computeRun * ef.value);
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
    }
  }

  /**
   * simple getter for the equipped armor item
   *
   * @returns {Item|null}
   */
  get wornArmor() {
    return this.itemTypes.armor.find((a) => a.system.equipped) ?? null;
  }

  get equippedMelee() {
    return this.itemTypes.meleeweapon.find((a) => a.system.equipped) ?? null;
  }

  get equippedMelees() {
    return this.itemTypes.meleeweapon.filter((a) => a.system.equipped) ?? null;
  }

  /**
   * @returns {object|false} the Hand of the actor or false if no default hand is set
   */
  getDefaultHand() {
    const hand = game.cards.find((c) => c.flags?.torgeternity?.defaultHand === this.id);
    if (hand) {
      return hand;
    } else {
      console.error(`no default hand for actor : ${this.name}`);
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
      type: 'hand',
      ownership: this.getHandOwnership(),
      flags: { torgeternity: { defaultHand: this.id } },
    };
    const characterHand = await Cards.create(cardData);

    // return the hand
    return characterHand;
  }

  /**
   * @returns {object} permission update object for use with the corresponding hand - which has the same owners as the SK, the default as observer, and deletes other permissions
   */
  getHandOwnership() {
    const handOwnership = foundry.utils.duplicate(this.ownership);
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
