import { ChatMessageTorg } from "./chat/document.js";

/**
 *
 */
export default class TorgeternityItem extends Item {
  static equipProp = "system.equipped";
  static equipClassProp = "system.equippedClass";
  static cssEquipped = "item-equipped";
  static cssUnequipped = "item-unequipped";

  static CHAT_TEMPLATE = {
    perk: "systems/torgeternity/templates/partials/perk-card.hbs",
    attack: "systems/torgeternity/templates/partials/attack-card.hbs",
    bonus: "systems/torgeternity/templates/partials/bonus-card.hbs",
    power: "systems/torgeternity/templates/partials/power-card.hbs",
    gear: "systems/torgeternity/templates/partials/gear-card.hbs",
    implant: "systems/torgeternity/templates/partials/implant-card.hbs",
    enhancement: "systems/torgeternity/templates/partials/enhancement-card.hbs",
    eternityshard: "systems/torgeternity/templates/partials/eternityshard-card.hbs",
    armor: "systems/torgeternity/templates/partials/armor-card.hbs",
    shield: "systems/torgeternity/templates/partials/shield-card.hbs",
    spell: "systems/torgeternity/templates/partials/spell-card.hbs",
    miracle: "systems/torgeternity/templates/partials/miracle-card.hbs",
    psionicpower: "systems/torgeternity/templates/partials/psionicpower-card.hbs",
    specialability: "systems/torgeternity/templates/partials/specialability-card.hbs",
    vehicle: "systems/torgeternity/templates/partials/vehicle-card.hbs",
    destinyCard: "systems/torgeternity/templates/partials/destinyCard.hbs",
    cosmCard: "systems/torgeternity/templates/partials/cosmCard.hbs",
    dramaCard: "systems/torgeternity/templates/partials/dramaCard.hbs",
    customSkill: "systems/torgeternity/templates/partials/customSkill-card.hbs",
    vehicleAddOn: "systems/torgeternity/templates/partials/vehicleAddOn-card.hbs",
  };

  /**
   *
   */
  prepareBaseData() {
    // Handle perk-related data
    if (this.type === "perk") {
      this.system.navStyle = "right:-210px;top:210px";
      this.system.extendedNav = true;
    } else {
      this.system.navStyle = "right:-110px;top:115px";
      this.system.extendedNav = false;
    }
  }

  static DEFAULT_ICONS = {
    gear: "gear-icon.webp",
    eternityshard: "eternityshard.webp",
    armor: "armor-icon.webp",
    shield: "shield.webp",
    meleeweapon: "meleeweapon.webp",
    missileweapon: "missileweapon.webp",
    firearm: "firearm.webp",
    implant: "implant.webp",
    heavyweapon: "heavyweapon.webp",
    vehicle: "vehicle.webp",
    perk: "perk.webp",
    enhancement: "enhancement.webp",
    specialability: "specialability.webp",
    "specialability-rollable": "specialability-rollable.webp",
    spell: "spell.webp",
    miracle: "miracle.webp",
    psionicpower: "psionicpower.webp",
  };

  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.img === "icons/svg/item-bag.svg") {
      const image = TorgeternityItem.DEFAULT_ICONS[data.type] ?? null;
      if (image) {
        this.updateSource({ img: "systems/torgeternity/images/icons/" + image });
      }
    }

    if (this.parent !== null && this.system.hasOwnProperty("equipped")) {
      // set the item to be equipped and un-equip other items of the same type
      this.update({
        [TorgeternityItem.equipProp]: true,
        [TorgeternityItem.equipClassProp]: TorgeternityItem.cssEquipped,
      });

      const actor = this.parent;
      const item = this;
      actor.items.forEach(function (otherItem, key) {
        if (otherItem._id !== item._id && otherItem.system.equipped && otherItem.type === item.type) {
          TorgeternityItem.toggleEquipState(otherItem, actor);
        }
      });
    }
  }

  /**
   *
   * @param item
   * @param actor
   * @returns {boolean}
   */
  static toggleEquipState(item, actor) {
    const equipped = !getProperty(item, TorgeternityItem.equipProp);
    const equipClass = equipped ? TorgeternityItem.cssEquipped : TorgeternityItem.cssUnequipped;

    // flip the flag/CSS class
    item.update({
      [TorgeternityItem.equipProp]: equipped,
      [TorgeternityItem.equipClassProp]: equipClass,
    });
    // enable/disable effects
    const sourceOrigin = "Item." + item._id;
    actor.effects.forEach(function (effect, key) {
      if (!!effect.origin) {
        if (effect.origin.endsWith(sourceOrigin)) {
          effect.update({ disabled: !equipped });
        }
      }
    });

    // return true if other items of same type need to be unequipped
    return equipped;
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
        template: TorgeternityItem.CHAT_TEMPLATE[this.type],
      },
    };

    return ChatMessageTorg.create(chatData);
  }

  /**
   *
   */
  async weaponAttack() {
    // Roll those dice!
    const dicerollint = new Roll("1d20x10x20").roll({ async: false });
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
        ? `Bonus: ${bonus >= 0 ? "+" : "-"}${bonus}`
        : (diceroll = 1 ? "Failure (Check for Mishap)" : `Bonus: -${bonus} (Disconnect if 4 Case)`);

    const baseDamage =
      this.system.damageType == "strengthPlus"
        ? parseInt(this.actor.system.attributes.strength) + parseInt(this.system.damage)
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
        template: TorgeternityItem.CHAT_TEMPLATE["attack"],
      },
    };

    chatData.speaker.actor = this.actor.id;
    chatData.weaponAttack = true;

    return ChatMessageTorg.create(chatData);
  }

  /**
   *
   */
  async bonus() {
    const rollResult = new Roll("1d6x6max5").roll({ async: false });

    const chatData = {
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      user: game.user.data._id,
      roll: rollResult,
      speaker: ChatMessage.getSpeaker(),
    };

    chatData.content = await rollResult.render();

    return ChatMessage.create(chatData);
  }

  /**
   *
   */
  async power() {
    // Roll those dice!
    const dicerollint = new Roll("1d20x10x20").roll({ async: false });
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
        ? `Bonus: ${bonus >= 0 ? "+" : "-"}${bonus}`
        : (diceroll = 1 ? "Failure (Check for Mishap)" : `Bonus: -${bonus} (Disconnect if 4 Case)`);

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
        template: TorgeternityItem.CHAT_TEMPLATE["power"],
      },
    };

    chatData.power = true;

    return ChatMessageTorg.create(chatData);
  }
}
