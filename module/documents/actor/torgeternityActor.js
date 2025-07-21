/**
 *
 */
export default class TorgeternityActor extends foundry.documents.Actor {
  /* -------------------------------------------- */
  /*  Getters                                     */
  /* -------------------------------------------- */

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

  get race() {
    return this.itemTypes.race[0] ?? null;
  }

  /* -------------------------------------------- */
  /*  Data Preparation                            */
  /* -------------------------------------------- */

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    // Here Effects are not yet applied
    if (this.type != 'vehicle') {
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

    if (this.type === 'stormknight') {
      if (this.race) {
        for (const attribute of Object.keys(this.race.system.attributeMaximum)) {
          this.system.attributes[attribute].maximum = this.race.system.attributeMaximum[attribute];
        }
        this.system.details.race = this.race.name;
      } else {
        this.system.details.race = game.i18n.localize('torgeternity.sheetLabels.noRace');
      }
    }
    if (this.type === 'vehicle') {
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
    super.prepareDerivedData();
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
    if (this.type != 'vehicle') {
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

  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    // by default creating a  hand for each stormknight
    if (this.type === 'stormknight' && game.user.isActiveGM) {
      this.createDefaultHand();
    }
  }

  /**
   * As per core Actor#modifyTokenAttribute but do NOT clamp the value when modifying shock or wounds
   * @param {*} attribute 
   * @param {*} value 
   * @param {*} isDelta 
   * @param {*} isBar 
   * @returns 
   */
  async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
    if (attribute !== 'shock' && attribute !== 'wounds') {
      return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
    }

    // Mostly the same as core Foundry
    const attr = foundry.utils.getProperty(this.system, attribute);
    const current = isBar ? attr.value : attr;
    const update = isDelta ? current + value : value;
    if (update === current) return this;
    let updates = { [`system.${attribute}.value`]: update };   // NO Math.clamp
    const allowed = Hooks.call("modifyTokenAttribute", { attribute, value, isDelta, isBar }, updates, this);
    return allowed !== false ? this.update(updates) : this;
  }

  /**
   * 
   * @param {*} changed 
   * @param {*} options 
   * @param {*} user 
   * @returns 
   */
  async _preUpdate(changed, options, user) {
    const isFullReplace = !((options.diff ?? true) && (options.recursive ?? true));
    if (!changed.system || isFullReplace) {
      return super._preUpdate(changed, options, user);
    }

    if (changed.img && !changed.prototypeToken?.texture?.src) {
      const oldtok = this.prototypeToken.texture.src;
      let updateToken;
      if (changed.img == oldtok || this.img == oldtok) {
        updateToken = true;
      } else {
        // Check for default image
        switch (this.type) {
          case 'stormknight':
            updateToken = (oldtok === 'icons/svg/mystery-man.svg');
            break;
          case 'threat':
            // Threats might have been changed to show a cosm-specific ring.
            updateToken = oldtok.startsWith('systems/torgeternity/images/characters/threat');
            break;
          case 'vehicle':
            updateToken = (oldtok === 'systems/torgeternity/images/characters/vehicle-land.webp');
            break;
        }
      }
      if (updateToken) {
        if (this.isToken)
          this.token.update({ texture: { src: changed.img } });
        else
          this.updateSource({ prototypeToken: { texture: { src: changed.img } } })
      }
    }
    // Apply attribute maximums
    if (this.type === 'stormknight') {
      for (const [attribute, { maximum }] of Object.entries(this?.system?.attributes)) {
        const changedAttribute = changed.system.attributes?.[attribute];
        if (typeof changedAttribute?.base === 'number') {
          const clampedAttribute = Math.clamp(changedAttribute.base, 0, maximum);
          if (changedAttribute.base > clampedAttribute) {
            changedAttribute.base = clampedAttribute;
            ui.notifications.error(
              game.i18n.localize('torgeternity.notifications.reachedMaximumAttr')
            );
          }
        }
      }
    }

    // Check for exceeding shock or wounds
    if (this.type !== 'vehicle' &&
      changed.system.shock?.value !== undefined &&
      changed.system.shock?.max === undefined) {
      if (changed.system.shock.value > this.system.shock.max) {
        // value will be clamped in prepareDerivedData
        options.shockExceeded = true;
      } else if (changed.system.shock.value < 0)
        changed.system.shock.value = 0;
    }
    if (changed.system.wounds?.value !== undefined &&
      changed.system.wounds.max === undefined) {
      if (changed.system.wounds.value > this.system.wounds.max) {
        // value will be clamped in prepareDerivedData
        options.woundsExceeded = true;
      } else if (changed.system.wounds.value < 0)
        changed.system.wounds.value = 0;
    }

    return super._preUpdate(changed, options, user);
  }

  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);

    if (this.type === 'stormknight') {
      const hand = this.getDefaultHand();
      // If there is no hand for that SK, and a GM is online, create one
      if (!hand && game.user.isActiveGM) {
        this.createDefaultHand();
      }
      // If the update includes permissions, sync them to the hand
      if (hand && changed['==ownership'] && game.userId === userId) {
        // DO NOT PUT ANYTHING ELSE IN THIS UPDATE! diff:false, recursive:false can easily nuke stuff
        hand.update({ ownership: this.getHandOwnership() }, { diff: false, recursive: false });
      }
    }

    // No further if we didn't initiate the update
    if (game.userId !== userId) return;

    /* Check for exceeding shock and/or wounds */

    if (options.woundsExceeded) {
      if (this.type === 'stormknight')
        this.notifyDefeat();
      else if (game.settings.get('torgeternity', 'autoWound'))
        this.toggleStatusEffect('dead', { active: true, overlay: true });
    }

    if (options.shockExceeded && !this.hasStatusEffect('dead') && game.settings.get('torgeternity', 'autoShock')) {
      this.toggleStatusEffect('unconscious', {
        active: true,
        overlay: true,
        duration: {
          startTime: game.time.worldTime,
          seconds: 30 * 60 // 30 minutes
        }
      });
    }

    if (options.woundsExceeded || options.shockExceeded) {
      const updates = {};
      // Remove the exceeded Max values
      if (options.shockExceeded) updates['system.shock.value'] = this.system.shock.max;
      if (options.woundsExceeded) updates['system.wounds.value'] = this.system.wounds.max;
      this.update(updates);
    }
  }


  _onDelete() {
    if (this.type === 'stormknight' && game.user.isActiveGM)
      this.getDefaultHand()?.delete();
  }

  /**
   * @returns {object|false} the Hand of the actor or false if no default hand is set
   */
  getDefaultHand() {
    return game.cards.find((c) => c.flags?.torgeternity?.defaultHand === this.id);
  }

  /**
   *
   */
  async createDefaultHand() {
    // creating a card hand then render it
    return await Cards.create({
      name: this.name,
      type: 'hand',
      ownership: this.getHandOwnership(),
      flags: { torgeternity: { defaultHand: this.id } },
    });
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

  async _preCreate(data, options, user) {
    super._preCreate(data, options, user);

    if (foundry.utils.hasProperty(data, 'prototypeToken')) return;

    switch (data.type) {
      case 'stormknight':
        await this.updateSource({
          prototypeToken: {
            sight: { enabled: true },
            actorLink: true,
            disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
            displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
            lockRotation: true,
            rotation: 0,
            texture: {
              src: data.img ?? 'icons/svg/mystery-man.svg',
              rotation: 0,
            },
            displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
            bar1: { attribute: 'wounds' },
            bar2: { attribute: 'shock' },
          }
        });
        break;

      case 'threat':
        await this.updateSource({
          img: data.img ?? 'systems/torgeternity/images/characters/threat.webp',
          prototypeToken: {
            sight: { enabled: true },
            //actorLink: false,
            disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
            displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
            // Core parameters
            // appendNumber: true,
            // prependAdjective: true,
            lockRotation: true,
            rotation: 0,
            texture: {
              src: 'systems/torgeternity/images/characters/threat-generic.Token.webp',
              rotation: 0,
            },
            displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
            bar1: { attribute: 'wounds' },
            bar2: { attribute: 'shock' },
          }
        });
        break;

      default:
        // Vehicles + other?
        await this.updateSource({
          img: 'systems/torgeternity/images/characters/vehicle-land.webp',
          prototypeToken: {
            sight: { enabled: true },
            //actorLink: false,
            disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
            displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
            lockRotation: true,
            rotation: 0,
            texture: {
              src: data.img ?? 'systems/torgeternity/images/characters/vehicle-land-Token.webp',
              rotation: 0,
            },
            displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
            bar1: { attribute: 'wounds' },
            bar2: { attribute: '' },
          }
        });
        break;
    }
  }

  get isDisconnected() {
    return this.statuses.has('disconnected') ?? false;
  }

  hasStatusEffect(statusId) {
    return this.statuses.has(statusId) ?? false;
  }

  /**
   * Apply the supplied amount of shock and/or wound damage to this actor.
   * Supplying a negative number will act as healing.
   * 
   * @param {number} shock The amount of shock to inflict on this actor.
   * @param {number} wounds The number of wounds to inflict on this actor.
   * @returns {Promise<this>}
   */
  applyDamages(shock, wounds) {
    let updates = {};
    let result = {};
    // No clamping of values
    if (shock && this.type !== 'vehicle') {
      const newvalue = this.system.shock.value + shock;
      if (newvalue > this.system.shock.max) result.shockExceeded = true;
      updates['system.shock.value'] = this.system.shock.value + shock;
    }
    if (wounds) {
      const newvalue = this.system.wounds.value + wounds;
      if (newvalue > this.system.wounds.max) result.woundsExceeded = true;
      updates['system.wounds.value'] = this.system.wounds.value + wounds;
    }
    this.update(updates);
    return result;
  }

  async notifyDefeat() {
    const attribute = (this.system.attributes.spirit.value < this.system.attributes.strength.value) ? 'spirit' : 'strength';

    const html = `<p>${game.i18n.format('torgeternity.defeat.prompt', { name: this.name })}
    <div class="skill-roll-menu">
     <a class="button roll-button roll-defeat ${(attribute === 'strength') && 'disabled'}"
     data-action="testDefeat" data-control="spirit" }>
     ${game.i18n.localize('torgeternity.attributes.spirit')}
     </a>
     <a class="button roll-button roll-defeat ${(attribute === 'spirit') && 'disabled'}" 
     data-action="testDefeat" data-control="strength" >
     ${game.i18n.localize('torgeternity.attributes.strength')}
     </a>
     </div>`;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: html
    })
  }
  /**
   * Very Stymied - self-imposed by Backlash3
   */
  async setVeryStymied() {
    // apply Stymied, or veryStymied
    if (this.hasStatusEffect('stymied')) {
      await this.toggleStatusEffect('stymied', { active: false });
    }

    if (!this.hasStatusEffect('veryStymied')) {
      let eff = await this.toggleStatusEffect('veryStymied', { active: true });
      eff.update({
        origin: this.uuid,
        duration: { rounds: 1, turns: 1 }
      })
    }
  }

  /**
   * Very Vulnerable - Self-imposed by performing an All-Out attack
   */
  async setVeryVulnerable() {
    // take away vulnerable effect
    await this.toggleStatusEffect('vulnerable', { active: false });

    let effect = this.appliedEffects.find((d) => d.statuses.find((e) => e === 'veryVulnerable'));
    if (!effect) {
      effect = await this.toggleStatusEffect('veryVulnerable', { active: true });
    }
    effect.update({ origin: this, duration: { rounds: 2, turns: 2 } })
  }

  async applyStymiedState(originid) {
    // apply Stymied, or veryStymied
    if (this.hasStatusEffect('veryStymied')) return;

    let statusId;
    if (this.hasStatusEffect('stymied')) {
      await this.toggleStatusEffect('stymied', { active: false });
      statusId = 'veryStymied';
    } else {
      statusId = 'stymied';
    }

    if (statusId) {
      const effect = await this.toggleStatusEffect(statusId, { active: true });
      effect.update({
        origin: originid,
        duration: { rounds: 1, turns: 1 }
      })
    }
  }

  /**
   * increase Vulnerable effect one step, up to VeryVulnerable
   * @param targetuuid
   */
  async applyVulnerableState(originid) {
    // apply Vulnerable, or veryVulnerable
    let statusId;
    if (this.hasStatusEffect('veryVulnerable')) return;

    if (this.hasStatusEffect('vulnerable')) {
      await this.toggleStatusEffect('vulnerable', { active: false });
      statusId = 'veryVulnerable';
    } else {
      statusId = 'vulnerable';
    }
    if (statusId) {
      const effect = await this.toggleStatusEffect(statusId, { active: true });
      effect.update({
        origin: originid,
        duration: { rounds: 1, turns: 1 }
      })
    }
  }

  /**
   * Sets an Active Defense no an actor with the supplied bonus.
   * @param {Number} bonus 
   */
  async setActiveDefense(bonus) {

    const equippedShield = this.items.find(item => item.type === 'shield' && item.system.equipped); // Search for an equipped shield
    let shieldBonus = (equippedShield && !this.hasStatusEffect('vulnerable') && !this.hasStatusEffect('veryVulnerable')) ? equippedShield.system.bonus : 0

    return this.createEmbeddedDocuments('ActiveEffect', [{
      name: 'ActiveDefense', // Add an icon to remind the defense, bigger ? Change color of Defense ?
      icon: 'icons/equipment/shield/heater-crystal-blue.webp', // To change I think, taken in Core, should have a dedicated file
      duration: { rounds: 1 },
      origin: this.uuid,
      changes: [
        {
          // Modify all existing "basic" defense in block
          key: 'defenses.dodge.mod', // Should need other work for defense vs powers
          value: bonus, // that don't target xxDefense
          priority: 20, // Create a data.ADB that store the bonus ?
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.intimidation.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.maneuver.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.meleeWeapons.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.taunt.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.trick.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.unarmedCombat.mod',
          value: bonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
        {
          key: 'defenses.toughness',
          value: shieldBonus,
          priority: 20,
          mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        },
      ],
      disabled: false,
    }]);
  }
}