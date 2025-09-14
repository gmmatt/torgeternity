import { torgeternity } from '../../config.js';

let deferredGunners = new Set();
/**
 *
 */
export default class TorgeternityItem extends foundry.documents.Item {
  // TODO: Chatcardtemplate for ammunitions & race
  static CHAT_TEMPLATE = {
    perk: 'systems/torgeternity/templates/chat/perk-card.hbs',
    attack: 'systems/torgeternity/templates/chat/attack-card.hbs',
    bonus: 'systems/torgeternity/templates/chat/bonus-card.hbs',
    power: 'systems/torgeternity/templates/chat/power-card.hbs',
    gear: 'systems/torgeternity/templates/chat/gear-card.hbs',
    implant: 'systems/torgeternity/templates/chat/implant-card.hbs',
    enhancement: 'systems/torgeternity/templates/chat/enhancement-card.hbs',
    eternityshard: 'systems/torgeternity/templates/chat/eternityshard-card.hbs',
    armor: 'systems/torgeternity/templates/chat/armor-card.hbs',
    shield: 'systems/torgeternity/templates/chat/shield-card.hbs',
    spell: 'systems/torgeternity/templates/chat/spell-card.hbs',
    miracle: 'systems/torgeternity/templates/chat/miracle-card.hbs',
    psionicpower: 'systems/torgeternity/templates/chat/psionicpower-card.hbs',
    specialability: 'systems/torgeternity/templates/chat/specialability-card.hbs',
    vehicle: 'systems/torgeternity/templates/chat/vehicle-card.hbs',
    destinyCard: 'systems/torgeternity/templates/chat/destinyCard.hbs',
    cosmCard: 'systems/torgeternity/templates/chat/cosmCard.hbs',
    dramaCard: 'systems/torgeternity/templates/chat/dramaCard.hbs',
    customSkill: 'systems/torgeternity/templates/chat/customSkill-card.hbs',
    vehicleAddOn: 'systems/torgeternity/templates/chat/vehicleAddOn-card.hbs',
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

  static migrateData(source) {
    // For better support, convert the old damaging abilities into custom attacks with a flat damage modifier.
    //if (source.type === 'specialability-rollable' && source.system?.damage && source.system.attackWith) {
    //  source.type = 'customAttack';
    //  source.system.damageType ??= 'flat'
    //}
    if (typeof source.system?.gunner?.name === 'string') {
      if (source.system.gunner.name)
        deferredGunners.add({ weaponId: source._id, gunnerName: source.system.gunner.name })
      if (source.system.gunner.skillValue)
        source.system.gunnerFixedSkill = parseInt(source.system.gunner.skillValue);
      delete source.system.gunner;
    }
    return super.migrateData(source);
  }
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
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

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

    if (this.type === 'perk' || this.type === 'customAttack')
      this.updateSource({ 'system.transferenceID': this.id }); // necessary for saving perks or custom attack data in race items
    else if (this.type === 'miracle')
      this.updateSource({ 'system.skill': 'faith' });
  }

  /**
   * When a new armor or shield is equipped, unequip any previously equipped item of the same type.
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (game.user.id !== userId) return;

    if (this.parent && ['armor', 'shield'].includes(this.type) && this.system.equipped) {
      const actor = this.parent;
      const previousEquipped = actor.items.find(
        item => item.id !== this.id && item.system.equipped && item.type === this.type
      );

      if (previousEquipped) {
        TorgeternityItem.toggleEquipState(previousEquipped, actor);
      }
    }
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
    const allowed = await super._preUpdate(changes, options, user);
    if (allowed === false) return false;

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

    if (this.type === 'implant' &&
      changes?.system?.implantType &&
      (!changes.img || this.img === changes.img) &&
      this.img.includes('systems/torgeternity/images/icons/')) {

      changes.img = `systems/torgeternity/images/icons/${changes.system.implantType}-icon.webp`;
    }
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
        .filter(it => it.id !== item.id && it.system.equipped && it.type === item.type)
        .forEach(it => {
          itemUpdates.push({
            _id: it.id,
            'system.equipped': false,
          });
          effectUpdates.push(
            ...actor.effects
              .filter((e) => e.origin && e.origin.endsWith('Item.' + it._id))
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
  async toMessage() {
    const renderedTemplate = await foundry.applications.handlebars.renderTemplate(TorgeternityItem.CHAT_TEMPLATE[this.type], this);

    return ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: await foundry.applications.ux.TextEditor.enrichHTML(renderedTemplate, { secrets: this.isOwner }),
    });
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
      case 2: return 3;
      case 4: return 7;
      case 6: return 50;
      case 0:
      default:
        return 1;
    }
  }

  /**
   * Return true if this item is a Perk that will always cause a contradiction when used outside its realm.
   * @param {TorgeternityScene} scene 
   * @returns {Boolean} 
   */
  isGeneralContradiction(scene) {
    return this.type === 'perk' &&
      this.system.cosm !== 'none' &&
      !scene.hasCosm(this.system.cosm);
  }

  /**
   * Indicates if this item will cause a contradiction in either of the supplied cosms,
   * or if it exceeds the provided axiom limits
   * @param {Object} maxAxioms (see CONFIG.torgeternity.axiomByCosm)
   * @returns Boolean
   */
  isContradiction(maxAxioms) {
    if (!maxAxioms) return false;

    const results = [];

    for (const field of Object.keys(maxAxioms))
      if (this.system.axioms[field] > maxAxioms[field])
        results.push({ axiom: field, item: this.system.axioms[field], max: maxAxioms[field] });

    return results.length ? results : null;
  }

  /**
   * Returns true if the item exceeds the current scene's axioms whilst on a disconnected actor,
   * or is a Starred Perk when the Item is not inside the correct cosm.
  */
  get isDisconnected() {
    // If not embedded, then it isn't disconnected
    if (!this.parent?.isDisconnected) return false;

    const scene = game.scenes.active;
    if (!scene || scene.torg.cosm === 'none') return false;

    // Some Perks just don't work outside their own COSM while disconnected
    if (this.isGeneralContradiction(scene)) return true;

    return this.isContradiction(scene.torg.axioms);
  }
}

/**
 * during MIGRATION of old format Vehicles, convert an old `gunner.name` StringField into a new `gunner` ForeignDocumentField
 */
Hooks.on('setup', async () => {
  const updates = deferredGunners;
  deferredGunners = null;
  for (const update of updates) {
    const gunner = game.actors.find(actor => actor.name === update.gunnerName);
    const vehicle = game.actors.find(actor => actor.type === 'vehicle' && actor.items.get(update.weaponId));
    const weapon = vehicle?.items.get(update.weaponId);
    if (gunner && weapon)
      await weapon.update({ 'system.gunner': gunner.id })
    else if (!gunner)
      console.warn(`GUNNER MIGRATION: Failed to find gunner called '${update.name}'`);
    else // weapon WILL be valid if vehicle is valid
      console.warn(`GUNNER MIGRATION: Failed to find vehicle with weapon Id '${update.weaponId}'`);
  }
})