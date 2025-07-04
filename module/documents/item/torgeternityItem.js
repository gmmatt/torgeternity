import { ChatMessageTorg } from '../chat/document.js';
import { torgeternity } from '../../config.js';

/**
 *
 */
export default class TorgeternityItem extends foundry.documents.Item {
  // TODO: Chatcardtemplate for ammunitions & race
  static CHAT_TEMPLATE = {
    perk: 'systems/torgeternity/templates/partials/perk-card.hbs',
    attack: 'systems/torgeternity/templates/partials/attack-card.hbs',
    bonus: 'systems/torgeternity/templates/partials/bonus-card.hbs',
    power: 'systems/torgeternity/templates/partials/power-card.hbs',
    gear: 'systems/torgeternity/templates/partials/gear-card.hbs',
    implant: 'systems/torgeternity/templates/partials/implant-card.hbs',
    enhancement: 'systems/torgeternity/templates/partials/enhancement-card.hbs',
    eternityshard: 'systems/torgeternity/templates/partials/eternityshard-card.hbs',
    armor: 'systems/torgeternity/templates/partials/armor-card.hbs',
    shield: 'systems/torgeternity/templates/partials/shield-card.hbs',
    spell: 'systems/torgeternity/templates/partials/spell-card.hbs',
    miracle: 'systems/torgeternity/templates/partials/miracle-card.hbs',
    psionicpower: 'systems/torgeternity/templates/partials/psionicpower-card.hbs',
    specialability: 'systems/torgeternity/templates/partials/specialability-card.hbs',
    vehicle: 'systems/torgeternity/templates/partials/vehicle-card.hbs',
    destinyCard: 'systems/torgeternity/templates/partials/destinyCard.hbs',
    cosmCard: 'systems/torgeternity/templates/partials/cosmCard.hbs',
    dramaCard: 'systems/torgeternity/templates/partials/dramaCard.hbs',
    customSkill: 'systems/torgeternity/templates/partials/customSkill-card.hbs',
    vehicleAddOn: 'systems/torgeternity/templates/partials/vehicleAddOn-card.hbs',
  };

  /**
   *
   */
  prepareBaseData() {
    // Handle perk-related data
    switch (this.type) {
      case 'perk':
        this.system.navStyle = 'right:-210px;top:210px';
        this.system.extendedNav = true;
        break;
      default:
        this.system.navStyle = 'right:-110px;top:115px';
        this.system.extendedNav = false;
    }

    for (const [key, value] of Object.entries(torgeternity.dnTypes)) {
      if (key === this.system?.dn) {
        this.system.dnType = game.i18n.localize(value);
        break;
      }
    }
  }

  static DEFAULT_ICONS = {
    ammunition: 'ammo-icon.webp',
    gear: 'gear-icon.webp',
    eternityshard: 'eternityshard.webp',
    armor: 'armor-icon.webp',
    shield: 'shield.webp',
    meleeweapon: 'axe-icon.webp',
    missileweapon: 'missile-weapon-icon.webp',
    firearm: 'firearm-icon.webp',
    implant: 'cyberware-icon.webp',
    heavyweapon: 'explosion-icon.webp',
    vehicle: 'vehicle-icon.webp',
    vehicleAddOn: 'vehicle-addon-icon.webp',
    perk: 'reality-icon.webp',
    enhancement: 'enhancement.webp',
    specialability: 'torgeternity-icon.webp',
    'specialability-rollable': 'bite-icon.webp',
    spell: 'spell-icon.webp',
    miracle: 'miracles-icon.webp',
    psionicpower: 'psionicpower.webp',
    race: 'race-icon.webp',
    customSkill: 'custom-skills.webp',
    customAttack: 'melee-weapon-icon.webp',
  };

  /**
   * Getter for a weapon that might have ammo or not (meelee weapons don't have ammo)
   *  @returns true/false
   */
  get weaponWithAmmo() {
    return this.type === 'firearm' || this.type === 'heavyweapon' || this.type === 'missileweapon'
      ? true
      : false;
  }

  async _preCreate(data, options, user) {
    super._preCreate(data, options, user);
    if (this.img === 'icons/svg/item-bag.svg') {
      const image = TorgeternityItem.DEFAULT_ICONS[data.type] ?? null;
      if (image) {
        await this.updateSource({ img: 'systems/torgeternity/images/icons/' + image });
      }
    }

    if (
      this.actor &&
      this?.actor?.system.details.race !== game.i18n.localize('torgeternity.sheetLabels.noRace') &&
      data.type === 'race'
    ) {
      ui.notifications.error(game.i18n.localize('torgeternity.notifications.raceExistent'));
      return false;
    }
  }

  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  async _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);

    if (this.parent && ['armor', 'shield'].includes(this.type) && this.system.equipped) {
      const actor = this.parent;
      const previousEquipped = actor.items.find(
        item => item.id !== this.id && item.system.equipped && item.type === this.type
      );

      if (previousEquipped) {
        TorgeternityItem.toggleEquipState(previousEquipped, actor);
      }
    }

    if (this.type === 'perk' || this.type === 'customAttack') {
      await this.update({ 'system.transferenceID': this.id }); // necessary for saving perks or custom attack data in race items
    }

    if (this.type === 'miracle') await this.update({ 'system.skill': 'faith' });
  }

  /**
   * See API https://foundryvtt.com/api/classes/foundry.abstract.Document.html#_preUpdate
   *
   * @param {any} changes
   * @param {any} options
   * @param {object} user Default: Base user
   * @returns
   */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) return false;

    if (
      foundry.utils.getProperty(changes, 'system.ammo') &&
      changes.system.ammo.value > this.system.ammo.max
    ) {
      changes.system.ammo.value = await Math.clamp(
        changes.system.ammo.value ?? this.system.ammo.value,
        0,
        changes.system.ammo.max ?? this.system.ammo.max
      );

      ui.notifications.warn(
        game.i18n.format('torgeternity.notifications.ammoValueExceedsMax', { a: this.name })
      );
    }
  }

  async _onUpdate(changed, options, userId) {
    await super._onUpdate(changed, options, userId);

    if (
      changed?.system &&
      this.type === 'implant' &&
      Object.keys(changed?.system)[0] === 'implantType' &&
      this.img.includes('systems/torgeternity/images/icons/')
    )
      await this.update({
        img: `systems/torgeternity/images/icons/${this.system.implantType}-icon.webp`,
      });
  }

  /**
   *
   * @param {Item} item the item that gets equipped or unequipped
   * @param {Actor} actor the actor that the item belongs to
   */
  static toggleEquipState(item, actor) {
    const wasEquipped = item.system.equipped;
    const itemUpdates = [
      {
        _id: item.id,
        'system.equipped': !wasEquipped,
      },
    ];
    // enable/disable effects
    const sourceOrigin = 'Item.' + item._id;
    const effectUpdates = actor.effects
      .filter((e) => e.origin && e.origin.endsWith(sourceOrigin))
      .map((e) => ({ _id: e.id, disabled: wasEquipped }));

    // for armors and shields, ensure that there is only one equipped at a time
    if (!wasEquipped && ['armor', 'shield'].includes(item.type)) {
      actor.items
        .filter(item => item.id !== item.id && item.system.equipped && item.type === item.type)
        .forEach(item => {
          itemUpdates.push({
            _id: item.id,
            'system.equipped': false,
          });
          effectUpdates.push(
            ...actor.effects
              .filter((e) => e.origin && e.origin.endsWith('Item.' + item._id))
              .map((e) => ({ _id: e.id, disabled: true }))
          );
        });
    }
    actor.updateEmbeddedDocuments('Item', itemUpdates);
    actor.updateEmbeddedDocuments('ActiveEffect', effectUpdates);
  }

  /**
   *
   */
  async roll() {
    const cardData = {
      ...this,
      owner: this.actor._id,
    };
    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      flags: {
        data: cardData,
        torgeternity: {
          template: TorgeternityItem.CHAT_TEMPLATE[this.type],
        }
      },
    };

    return ChatMessageTorg.create(chatData);
  }

  /**
   *
   */
  async weaponAttack() {
    // Roll those dice!
    const dicerollint = await new Roll('1d20x10x20').roll();
    dicerollint.toMessage();
    const diceroll = dicerollint.total;

    // get Bonus number
    const bonus =
      diceroll === 1
        ? -10
        : diceroll <= 8
          ? Math.ceil(diceroll / 2 - 5) * 2
          : diceroll <= 14
            ? Math.ceil(diceroll / 2 - 6)
            : diceroll <= 20
              ? diceroll - 13
              : 7 + Math.ceil((diceroll - 20) / 5);

    const messageContent =
      diceroll > 4
        ? `Bonus: ${bonus >= 0 ? '+' : '-'}${bonus}`
        : (diceroll = 1 ? 'Failure (Check for Mishap)' : `Bonus: -${bonus} (Disconnect if 4 Case)`);

    const baseDamage =
      this.system.damageType == 'strengthPlus'
        ? this.actor.system.attributes.strength.value + parseInt(this.system.damage)
        : this.system.damage;

    // Retrieve the applicable skill value from the current actor
    const skillToUse = this.actor.system.skills[this.system.attackWith];
    const skillValue = skillToUse.value;

    // Generate final Roll Result
    const rollResult = parseInt(skillValue) + parseInt(bonus);

    // Assemble information needed by attack card
    const cardData = {
      ...this.data,
      owner: this.actor.id,
      bonus: messageContent,
      skillValue: skillValue,
      result: rollResult,
      baseDamage: baseDamage,
    };

    // Put together Chat Data
    const chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
      flags: {
        data: cardData,
        torgeternity: {
          template: TorgeternityItem.CHAT_TEMPLATE['attack'],
        }
      },
    };

    chatData.speaker.actor = this.actor.id;
    chatData.weaponAttack = true;

    return ChatMessageTorg.create(chatData);
  }

  // Commented that out because I don't think it's needed anymore but I don't know yet :D
  /* async bonus() {
    const rollResult = await new Roll('1d6x6max5').roll();

    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      user: game.user.data._id,
      roll: rollResult,
      speaker: ChatMessage.getSpeaker(),
    };

    chatData.content = await rollResult.render();

    return ChatMessage.create(chatData);
  }*/

  /**
   *
   */
  async power() {
    // Roll those dice!
    const dicerollint = await new Roll('1d20x10x20').roll();
    dicerollint.toMessage();
    const diceroll = dicerollint.total;

    const bonus =
      diceroll === 1
        ? -10
        : diceroll <= 8
          ? Math.ceil(diceroll / 2 - 5) * 2
          : diceroll <= 14
            ? Math.ceil(diceroll / 2 - 6)
            : diceroll <= 20
              ? diceroll - 13
              : 7 + Math.ceil((diceroll - 20) / 5);

    const messageContent =
      diceroll > 4
        ? `Bonus: ${bonus >= 0 ? '+' : '-'}${bonus}`
        : (diceroll = 1 ? 'Failure (Check for Mishap)' : `Bonus: -${bonus} (Disconnect if 4 Case)`);

    // Retrieve the applicable skill value from the current actor
    const skillToUse = this.actor.system.skills[this.system.skill];
    const skillValue = skillToUse.value;

    // Generate final Roll Result
    const rollResult = parseInt(skillValue) + parseInt(bonus);

    // Assemble information needed by attack card
    const cardData = {
      ...this.data,
      owner: this.actor.data._id,
      bonus: messageContent,
      skillValue: skillValue,
      result: rollResult,
      baseDamage: this.system.damage,
    };

    // Put together Chat Data
    const chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
      flags: {
        data: cardData,
        torgeternity: {
          template: TorgeternityItem.CHAT_TEMPLATE['power'],
        }
      },
    };

    chatData.power = true;

    return ChatMessageTorg.create(chatData);
  }

  /**
   * Does the weapon have ammo?
   *
   * @returns {boolean} Does the weapon have ammo? True/False
   */
  get hasAmmo() {
    return this.system?.ammo.value > 0 ? true : false;
  }

  /**
   * Does the weapon have sufficient ammo? Will only be important for burst attacks.
   *
   * @param {number} burstModifier The Burstmodifier whereas the amount of bullets are calculated from
   * @param {number} targets The amount of targets
   * @returns {boolean} True/False if the check is ok
   */
  hasSufficientAmmo(burstModifier, targets = 1) {
    const currentAmmo = this.system.ammo.value;
    const bulletAmount = this._estimateBulletLoss(burstModifier);

    return currentAmmo < bulletAmount * targets ? false : true;
  }

  /**
   * Reduces the ammo of a weapon
   *
   * @param {number} burstModifier the burst mode to estimate the bullets
   * @param {number} targets The quantity of targets
   */
  async reduceAmmo(burstModifier, targets = 1) {
    const currentAmmo = this.system.ammo.value;

    await this.update({
      'system.ammo.value': currentAmmo - this._estimateBulletLoss(burstModifier) * targets,
    });
  }

  /**
   * Estimates the number of used bullets.
   *
   * @param {number} burstModifier The modifier of the burst (on no burst, this will be 0 per Standard)
   * @returns {number} The amount of bullets that are used
   */
  _estimateBulletLoss(burstModifier) {
    switch (burstModifier) {
      case 2:
        return 3;

      case 4:
        return 7;

      case 6:
        return 50;

      case 0:
      default:
        return 1;
    }
  }
}
