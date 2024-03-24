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
    if (this.type === "stormknight") {
      for (const item of this.itemTypes.armor) {
        item.system.equippedClass = item.system.equipped ? "item-equipped" : "item-unequipped";
      }
      for (const item of this.itemTypes.shield) {
        item.system.equippedClass = item.system.equipped ? "item-equipped" : "item-unequipped";
      }
    }
    if (["threat", "stormknight"].includes(this.type)) {
      // initialize the worn armor bonus
      this.system.other.armor = this.wornArmor?.system?.bonus ?? 0;
      this.system.fatigue = 2 + this.wornArmor?.system?.fatigue ?? 0;
      this.maxDex = this.wornArmor?.system?.maxDex ?? null;
      this.minStrength = this.wornArmor?.system?.minStrength ?? null;
    }
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    // Here Effects are applied, whatever follow cannot be directly affected by Effects

    // Skillsets
    if (["threat", "stormknight"].includes(this.type)) {
      // Set base unarmedDamage from interaction
      const skills = this.system.skills;
      const attributes = this.system.attributes;

      const unarmedDamageMod = this.system.unarmedDamageMod || 0;
      this.system.unarmedDamage = attributes.strength + unarmedDamageMod;

      // Set Defensive Values based on modified attributes
      const dodgeDefenseMod = this.system.dodgeDefenseMod || 0;
      const dodgeDefenseSkill = skills.dodge.value || attributes.dexterity;
      this.system.dodgeDefense = dodgeDefenseSkill + dodgeDefenseMod;

      const meleeWeaponsDefenseMod = this.system.meleeWeaponsDefenseMod || 0;
      const meleeWeaponsDefenseSkill = skills.meleeWeapons.value || attributes.dexterity;
      this.system.meleeWeaponsDefense = meleeWeaponsDefenseSkill + meleeWeaponsDefenseMod;

      const unarmedCombatDefenseMod = this.system.unarmedCombatDefenseMod || 0;
      const unarmedCombatDefenseSkill = skills.unarmedCombat.value || attributes.dexterity;
      this.system.unarmedCombatDefense = unarmedCombatDefenseSkill + unarmedCombatDefenseMod;

      const intimidationDefenseMod = this.system.intimidationDefenseMod || 0;
      const intimidationDefenseSkill = skills.intimidation.value || attributes.spirit;
      this.system.intimidationDefense = intimidationDefenseSkill + intimidationDefenseMod;

      const maneuverDefenseMod = this.system.maneuverDefenseMod || 0;
      const maneuverDefenseSkill = skills.maneuver.value || attributes.dexterity;
      this.system.maneuverDefense = maneuverDefenseSkill + maneuverDefenseMod;

      const tauntDefenseMod = this.system.tauntDefenseMod || 0;
      const tauntDefenseSkill = skills.taunt.value || attributes.charisma;
      this.system.tauntDefense = tauntDefenseSkill + tauntDefenseMod;

      const trickDefenseMod = this.system.trickDefenseMod || 0;
      const trickDefenseSkill = skills.trick.value || attributes.mind;
      this.system.trickDefense = trickDefenseSkill + trickDefenseMod;
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
    return this.itemTypes.armor.find((a) => a.system.equipped) ?? null;
  }

  /**
   * @returns {object} the Hand of the actor
   */
  getDefaultHand() {
    const setting = game.settings.get("torgeternity", "deckSetting");
    const handId =
      setting.stormknights[this.id] ?? game.cards.find((c) => c.data.flags?.torgeternity?.defaultHand === this.id)?.id;
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
      type: "hand",
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
    const settingData = game.settings.get("torgeternity", "deckSetting");
    settingData.stormknights[actorId] = handId;
    await game.settings.set("torgeternity", "deckSetting", settingData);

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
