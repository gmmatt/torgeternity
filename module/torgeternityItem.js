/**
 *
 */
export default class torgeternityItem extends Item {
  static equipProp = "system.equipped";
  static equipClassProp = "system.equippedClass";
  static cssEquipped = "item-equipped";
  static cssUnequipped = "item-unequipped";

  chatTemplate = {
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
    if (this._source.type === "perk") {
      this.system.navStyle = "right:-210px;top:210px";
      this.system.extendedNav = true;
    } else {
      this.system.navStyle = "right:-110px;top:115px";
      this.system.extendedNav = false;
    }
  }

  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    let image;
    switch (data.type) {
      case "gear":
        image = "gear-icon.webp";
        break;
      case "eternityshard":
        image = "eternityshard.webp";
        break;
      case "armor":
        image = "armor-icon.webp";
        break;
      case "shield":
        image = "shield.webp";
        break;
      case "meleeweapon":
        image = "meleeweapon.webp";
        break;
      case "missileweapon":
        image = "missileweapon.webp";
        break;
      case "firearm":
        image = "firearm.webp";
        break;
      case "implant":
        image = "implant.webp";
        break;
      case "heavyweapon":
        image = "heavyweapon.webp";
        break;
      case "vehicle":
        image = "vehicle.webp";
        break;
      case "perk":
        image = "perk.webp";
        break;
      case "enhancement":
        image = "enhancement.webp";
        break;
      case "specialability":
        image = "specialability.webp";
        break;
      case "specialability-rollable":
        image = "specialability-rollable.webp";
        break;
      case "spell":
        image = "spell.webp";
        break;
      case "miracle":
        image = "miracle.webp";
        break;
      case "psionicpower":
        image = "psionicpower.webp";
        break;
      case "customSkill":
      case "vehicleAddon":
      case "customAttack":
      default:
    }
    if (image) this.update({ img: "systems/torgeternity/images/icons/" + image });

    if (this.parent !== null && this.system.hasOwnProperty("equipped")) {
      // set the item to be equipped and un-equip other items of the same type
      this.update({
        [torgeternityItem.equipProp]: true,
        [torgeternityItem.equipClassProp]: torgeternityItem.cssEquipped,
      });

      const actor = this.parent;
      const item = this;
      actor.items.forEach(function (otherItem, key) {
        if (otherItem._id !== item._id && otherItem.system.equipped && otherItem.type === item.type) {
          torgeternityItem.toggleEquipState(otherItem, actor);
        }
      });
    }
  }

  /**
   *
   * @param item
   * @param actor
   */
  static toggleEquipState(item, actor) {
    const equipped = !getProperty(item, torgeternityItem.equipProp);
    const equipClass = equipped ? torgeternityItem.cssEquipped : torgeternityItem.cssUnequipped;

    // flip the flag/CSS class
    item.update({
      [torgeternityItem.equipProp]: equipped,
      [torgeternityItem.equipClassProp]: equipClass,
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
    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
    };

    const cardData = {
      ...this,
      owner: this.actor._id,
    };

    chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);

    return ChatMessage.create(chatData);
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

    // Put together Chat Data
    const chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
    };

    // Assemble information needed by attack card

    const cardData = {
      ...this.data,
      owner: this.actor.id,
      bonus: messageContent,
      skillValue: skillValue,
      result: rollResult,
      baseDamage: baseDamage,
    };

    // Send the chat
    chatData.content = await renderTemplate(this.chatTemplate["attack"], cardData);

    chatData.speaker.actor = this.actor.id;
    chatData.weaponAttack = true;

    return ChatMessage.create(chatData);
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

    // Put together Chat Data
    const chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
    };

    // Assemble information needed by attack card
    const cardData = {
      ...this.data,
      owner: this.actor.data._id,
      bonus: messageContent,
      skillValue: skillValue,
      result: rollResult,
      baseDamage: this.system.damage,
    };

    // Send the chat
    chatData.content = await renderTemplate(this.chatTemplate["power"], cardData);

    chatData.power = true;

    return ChatMessage.create(chatData);
  }
}
