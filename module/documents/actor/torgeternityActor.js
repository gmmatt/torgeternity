/**
 *
 */
export default class TorgeternityActor extends Actor {
  /**
   * @inheritdoc
   */
  prepareBaseData() {
    // Here Effects are not yet applied
    // Set armor and shield toggle states
    if (this.type === 'stormknight') {
      for (const item of this.itemTypes.armor) {
        item.system.equippedClass = item.system.equipped ? 'item-equipped' : 'item-unequipped';
      }
      for (const item of this.itemTypes.shield) {
        item.system.equippedClass = item.system.equipped ? 'item-equipped' : 'item-unequipped';
      }
    }
    if (['threat', 'stormknight'].includes(this.type)) {
      // initialize the worn armor bonus
      this.system.other.armor = this.wornArmor?.system?.bonus ?? 0;
      this.system.fatigue = 2 + (this.wornArmor?.system?.fatigue ?? 0);
      this.system.maxDex = this.wornArmor?.system?.maxDex ?? 100;
      this.system.minStr = this.wornArmor?.system?.minStrength ?? 0;
    }
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    // Here Effects are applied, whatever follow cannot be directly affected by Effects

    // Skillsets
    if (['threat', 'stormknight'].includes(this.type)) {
      // by RAW, FIRST you checkout for maxDex, THEN minStr. Doing this into DerivedData means, it takes place after AE's were applied, making sure, this cannot get higher than armor's limitations.
      this.system.attributes.dexterity.value > this.system.maxDex
        ? (this.system.attributes.dexterity.value = this.system.maxDex)
        : this.system.attributes.dexterity.value;

      this.system.attributes.strength.value < this.system.minStr
        ? (this.system.attributes.dexterity.value -=
            this.system.minStr - this.system.attributes.strength.value)
        : this.system.attributes.dexterity.value;

      //
      this.system.other.move = this.system.attributes.dexterity.value;
      this.system.other.run = this.system.attributes.dexterity.value * 3;
      // Derive Skill values for Storm Knights and Threats
      for (const [name, skill] of Object.entries(this.system.skills)) {
        const trained = skill.unskilledUse === 1 || this._source.system.skills[name].adds;
        skill.value = trained ? this.system.attributes[skill.baseAttribute].value + skill.adds : '';
      }
      //
      // Set base unarmedDamage from interaction
      const skills = this.system.skills;
      const attributes = this.system.attributes;

      const unarmedDamageMod = this.system.unarmedDamageMod || 0;
      this.system.unarmedDamage = attributes.strength.value + unarmedDamageMod;

      // Set Defensive Values based on modified attributes
      const dodgeDefenseMod = this.system.dodgeDefenseMod || 0;
      const dodgeDefenseSkill = skills.dodge.value || attributes.dexterity.value;
      this.system.dodgeDefense = dodgeDefenseSkill + dodgeDefenseMod;

      const meleeWeaponsDefenseMod = this.system.meleeWeaponsDefenseMod || 0;
      const meleeWeaponsDefenseSkill = skills.meleeWeapons.value || attributes.dexterity.value;
      this.system.meleeWeaponsDefense = meleeWeaponsDefenseSkill + meleeWeaponsDefenseMod;

      const unarmedCombatDefenseMod = this.system.unarmedCombatDefenseMod || 0;
      const unarmedCombatDefenseSkill = skills.unarmedCombat.value || attributes.dexterity.value;
      this.system.unarmedCombatDefense = unarmedCombatDefenseSkill + unarmedCombatDefenseMod;

      const intimidationDefenseMod = this.system.intimidationDefenseMod || 0;
      const intimidationDefenseSkill = skills.intimidation.value || attributes.spirit.value;
      this.system.intimidationDefense = intimidationDefenseSkill + intimidationDefenseMod;

      const maneuverDefenseMod = this.system.maneuverDefenseMod || 0;
      const maneuverDefenseSkill = skills.maneuver.value || attributes.dexterity.value;
      this.system.maneuverDefense = maneuverDefenseSkill + maneuverDefenseMod;

      const tauntDefenseMod = this.system.tauntDefenseMod || 0;
      const tauntDefenseSkill = skills.taunt.value || attributes.charisma.value;
      this.system.tauntDefense = tauntDefenseSkill + tauntDefenseMod;

      const trickDefenseMod = this.system.trickDefenseMod || 0;
      const trickDefenseSkill = skills.trick.value || attributes.mind.value;
      this.system.trickDefense = trickDefenseSkill + trickDefenseMod;
    }
    // Apply the moveMod effect for SKs & threats
    if (this.type === 'stormknight' || this.type === 'threat') {
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
      //
    } else if (this.type === 'vehicle') {
    }
  }

  /**
   *
   */
  applyActiveEffects() {
    super.applyActiveEffects();

    const effects = this.effects;

    if (
      effects.contents.find(
        (ef) =>
          ef.name === game.i18n.localize(`torgeternity.statusEffects.veryStymied`) && ef.active
      )
    ) {
      this.system.stymiedModifier = -4;
    } else if (
      effects.contents.find(
        (ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.stymied`) && ef.active
      )
    ) {
      this.system.stymiedModifier = -2;
    } else this.system.stymiedModifier = 0;

    if (
      effects.contents.find(
        (ef) =>
          ef.name === game.i18n.localize(`torgeternity.statusEffects.veryVulnerable`) && ef.active
      )
    ) {
      this.system.vulnerableModifier = 4;
    } else if (
      effects.contents.find(
        (ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.vulnerable`) && ef.active
      )
    ) {
      this.system.vulnerableModifier = 2;
    } else this.system.vulnerableModifier = 0;

    if (
      effects.contents.find(
        (ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.pitchBlack`) && ef.active
      )
    ) {
      this.system.darknessModifier = -6;
    } else if (
      effects.contents.find(
        (ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.dark`) && ef.active
      )
    ) {
      this.system.darknessModifier = -4;
    } else if (
      effects.contents.find(
        (ef) => ef.name === game.i18n.localize(`torgeternity.statusEffects.dim`) && ef.active
      )
    ) {
      this.system.darknessModifier = -2;
    } else this.system.darknessModifier = 0;
  }

  /**
   * simple getter for the equipped armor item
   *
   * @returns {Item|null}
   */
  get wornArmor() {
    return this.itemTypes.armor.find((a) => a.system.equipped) ?? null;
  }

  /**
   * @returns {object} the Hand of the actor
   */
  getDefaultHand() {
    const setting = game.settings.get('torgeternity', 'deckSetting');
    const handId =
      setting.stormknights[this.id] ??
      game.cards.find((c) => c.flags?.torgeternity?.defaultHand === this.id)?.id;
    if (handId) {
      return game.cards.get(handId);
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

    // getting ids of actor and card hand
    const actorId = this.id;
    const handId = characterHand.id;

    // storing ids in game.settings
    // deprecated, use the flag on the hand itself instead
    // this can be removed in a future version
    // reason: can be broken by race condition
    const settingData = game.settings.get('torgeternity', 'deckSetting');
    settingData.stormknights[actorId] = handId;
    await game.settings.set('torgeternity', 'deckSetting', settingData);

    // return the hand
    return characterHand;
  }

  /**
   * @returns {object} permission update object for use with the corresponding hand - which has the same owners as the SK, the default as observer, and deletes other permissions
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
