import { onManageActiveEffect, prepareActiveEffectCategories } from '../effects.js';

/**
 *
 */
export default class TorgeternityItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity', 'sheet', 'app', 'item', 'item-sheet'],
    window: {
      resizable: true,
    },
    position: {
      width: 530,
      height: 580,
    },
    tabs: [
      {
        navSelector: '.sheet-tabs',
        contentSelector: '.sheet-body',
        initial: 'stats',
      },
    ],
    actions: {
      effectControl: TorgeternityItemSheet.#onEffectControl,
      convertRsa: TorgeternityItemSheet.#onConvertRsa,
      addEnhancement: TorgeternityItemSheet.#onAddEnhancement,
      removeEnhancement: TorgeternityItemSheet.#onRemoveEnhancement,
      addLimitation: TorgeternityItemSheet.#onAddLimitation,
      removeLimitation: TorgeternityItemSheet.#onRemoveLimitation,
      reloadWeapon: TorgeternityItemSheet.#onReloadWeapon,
      selectSecondaryAxiom: TorgeternityItemSheet.#onSelectSecondaryAxiom,
      itemName: TorgeternityItemSheet.#onItemName,
      itemDelete: TorgeternityItemSheet.#onItemDelete,
    },
    dragDrop: [
      {
        dragSelector: '.item-list .item', // '[data-drag]',
        dropSelector: null,
      },
    ],
    //scrollY: ['.stats', '.effects', '.background'],
  }

  static PARTS = {
    header: { template: 'systems/torgeternity/templates/sheets/item-header.hbs' },
    tabs: { template: 'templates/generic/tab-navigation.hbs' },
    effects: { template: 'systems/torgeternity/templates/parts/active-effects.hbs' },

    actionCard: { template: `systems/torgeternity/templates/sheets/actionCard-sheet.html` },
    ammunition: { template: `systems/torgeternity/templates/sheets/ammunition-sheet.html` },
    armor: { template: `systems/torgeternity/templates/sheets/armor-sheet.html` },
    cosmCard: { template: `systems/torgeternity/templates/sheets/cosmCard-sheet.html` },
    customAttack: { template: `systems/torgeternity/templates/sheets/customAttack-sheet.html` },
    customSkill: { template: `systems/torgeternity/templates/sheets/customSkill-sheet.html` },
    destinyCard: { template: `systems/torgeternity/templates/sheets/destinyCard-sheet.html` },
    enhancement: { template: `systems/torgeternity/templates/sheets/enhancement-sheet.html` },
    eternityshard: { template: `systems/torgeternity/templates/sheets/eternityshard-sheet.html` },
    firearm: { template: `systems/torgeternity/templates/sheets/firearm-sheet.html` },
    gear: { template: `systems/torgeternity/templates/sheets/gear-sheet.html` },
    heavyweapon: { template: `systems/torgeternity/templates/sheets/heavyweapon-sheet.html` },
    implant: { template: `systems/torgeternity/templates/sheets/implant-sheet.html` },
    meleeweapon: { template: `systems/torgeternity/templates/sheets/meleeweapon-sheet.html` },
    miracle: { template: `systems/torgeternity/templates/sheets/miracle-sheet.html` },
    missileweapon: { template: `systems/torgeternity/templates/sheets/missileweapon-sheet.html` },
    perk: { template: `systems/torgeternity/templates/sheets/perk-sheet.html` },
    perkEnhancements: { template: `systems/torgeternity/templates/sheets/perk-enhancements-sheet.html` },
    perkLimitations: { template: `systems/torgeternity/templates/sheets/perk-limitations-sheet.html` },
    psionicpower: { template: `systems/torgeternity/templates/sheets/psionicpower-sheet.html` },
    race: { template: `systems/torgeternity/templates/sheets/race-sheet.html` },
    racePerks: { template: `systems/torgeternity/templates/sheets/race-perks-sheet.html` }, // TODO
    shield: { template: `systems/torgeternity/templates/sheets/shield-sheet.html` },
    ["specialability-rollable"]: { template: `systems/torgeternity/templates/sheets/specialability-rollable-sheet.html` },
    specialability: { template: `systems/torgeternity/templates/sheets/specialability-sheet.html` },
    spell: { template: `systems/torgeternity/templates/sheets/spell-sheet.html` },
    vehicleHeader: { template: `systems/torgeternity/templates/sheets/vehicle-header-sheet.html` },
    vehicle: { template: `systems/torgeternity/templates/sheets/vehicle-sheet.html` },
    vehicleAddOn: { template: `systems/torgeternity/templates/sheets/vehicleAddOn-sheet.html` },

    powers: { template: `systems/torgeternity/templates/parts/active-effects.hbs` }
  };

  /**
   *
   * @param {...any} args
   */
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #dragDrop;

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

  /** @inheritdoc */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /** @inheritdoc
   *
   * won't be activated due to
   */

  _onDragStart(event) {
    console.log(event);
  }

  _onDragOver(event) {
    console.log(event);
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const dropedObject = await fromUuid(data.uuid);

    if (dropedObject.type === 'perk' && this.item.type === 'race')
      await this.dropPerkOnRace(dropedObject);
    if (dropedObject.type === 'customAttack' && this.item.type === 'race')
      await this.dropAttackOnRace(dropedObject);
  }

  async dropPerkOnRace(perk) {
    if (perk.system.category != 'racial') {
      ui.notifications.error(
        game.i18n.format('torgeternity.notifications.notAPerkItem', {
          a: game.i18n.localize('torgeternity.perkTypes.' + perk.system.category),
        })
      );
      return;
    }

    const currentPerks =
      this.item.system.perksData instanceof Set ? this.item.system.perksData : new Set();

    currentPerks.add(perk);

    await this.item.update({ 'system.perksData': Array.from(currentPerks) });
  }

  async dropAttackOnRace(attack) {
    const currentAttacks =
      this.item.system.customAttackData instanceof Set
        ? this.item.system.customAttackData
        : new Set();

    currentAttacks.add(attack);

    await this.item.update({ 'system.customAttackData': Array.from(currentAttacks) });
  }

  /**
   *
   * @param html
   */
  _onRender(context, options) {
    super._onRender(context, options);
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  /**
   * Actions
   * @param {} event 
   * @param {*} target 
   */
  static #onEffectControl(event, target) {
    if (this.item.isOwned)
      return ui.notifications.warn(
        game.i18n.localize('torgeternity.notifications.noActiveEffectInOwnedItem')
      );
    onManageActiveEffect(ev, this.item);
  }

  static #onConvertRsa(event, target) {
    this.item.update({
      type: 'specialability-rollable',
    });
  }

  static #onAddEnhancement(event, target) {
    const currentShown = this.document.system.pulpPowers.enhancementNumber;
    const newShown = currentShown < 15 ? currentShown + 1 : currentShown;
    this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
  }


  static #onRemoveEnhancement(event, target) {
    const currentShown = this.document.system.pulpPowers.enhancementNumber;
    const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
    this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
  }

  static #onAddLimitation(event, target) {
    const currentShown = this.document.system.pulpPowers.limitationNumber;
    const newShown = currentShown < 10 ? currentShown + 1 : currentShown;
    this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
  }

  static #onRemoveLimitation(event, target) {
    const currentShown = this.document.system.pulpPowers.limitationNumber;
    const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
    this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
  }

  static async #onReloadWeapon(event, target) {
    const button = event.currentTarget.closest('[data-item-id]');
    const usedAmmo = this?.actor.items.get(button.dataset.itemId);

    await reloadAmmo(this.actor, this.object, usedAmmo, this);
    this.render(true);
  }

  static #onSelectSecondaryAxiom(event, target) {
    event.currentTarget.value === 'none' &&
      this.item.update({ 'system.secondaryAxiom.value': null });
  }

  static #onItemName(event, target) {
    const section = event.currentTarget.closest('.item');
    const detail = $(section).find('.item-detail').get(0);

    if (!detail) return;
    detail.style.display =
      detail.style.display === 'none' || !detail.style.display
        ? (detail.style.display = 'block')
        : (detail.style.display = 'none');
  }

  static #onItemDelete(event, target) {
    if (this.item.type === 'race') {
      const inheritedType = $(event.currentTarget.closest('.item')).attr('data-inheritedType');
      const id = $(event.currentTarget.closest('.item')).attr('data-item-id');
      const raceItem = this.item;
      const allThingsOfRaceItem =
        inheritedType === 'perk' ? raceItem.system.perksData : raceItem.system.customAttackData;

      if (!allThingsOfRaceItem) return; // just for safety

      for (const thing of allThingsOfRaceItem) {
        if (thing.system.transferenceID === id) {
          allThingsOfRaceItem.delete(thing);
          break;
        }
      }
      if (inheritedType === 'perk') {
        raceItem.update({ 'system.perksData': Array.from(allThingsOfRaceItem) });
      } else {
        raceItem.update({ 'system.customAttackData': Array.from(allThingsOfRaceItem) });
      }
    }
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    // Decide which tabs are required
    switch (this.document.type) {
      case 'perk':
        options.parts = ['header', 'tabs', 'perk', 'perkEnhancements', 'perkLimitations', 'effects'];
        break;
      default:
        options.parts = ['header', 'tabs', this.document.type, 'effects'];
        break;
    }

    // On first render, set the height
    if (options.isFirstRender) {
      switch (this.document.type) {
        case 'firearm':
          options.position.height = 710;
          break;
        case 'heavyweapon':
          options.position.height = 730;
          break;
        case 'meleeweapon':
          options.position.height = 675;
          break;
        case 'missileweapon':
          options.position.height = 710;
          break;
        case 'miracle':
        case 'psionicpower':
        case 'spell':
          options.position.height = 780;
          break;
        case 'specialability':
          options.position.width = 435;
          options.position.height = 550;
          break;
        case 'specialability-rollable':
          options.position.height = 625;
          break;
        case 'vehicle':
          options.position.height = 630;
          break;
        case 'implant':
        case 'armor':
        case 'shield':
          options.position.height = 615;
          break;
        case 'customAttack':
          options.position.height = 675;
          break;
        case 'vehicleAddOn':
          options.position.height = 620;
          options.position.width = 465;
          break;
        case 'perk':
          options.parts = ['header', 'tabs', 'perk', 'perkEnhancements', 'perkLimitations', 'effects'];
          options.position.height = 560;

        default:
          options.position.height = 560;
      }
    }
  }

  _preparePartContext(partId, context) {
    context.partId = `${this.id}-${partId}`;
    if (partId === this.item.type)
      context.tab = context.tabs.stats;   // so template can access tab.cssClass
    else
      context.tab = context.tabs[partId];   // so template can access tab.cssClass
    return context;
  }
  /**
   *
   * @param options
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.effects = prepareActiveEffectCategories(this.document.effects);
    context.item = context.document;

    context.config = CONFIG.torgeternity;

    context.description = await foundry.applications.ux.TextEditor.enrichHTML(this.document.system.description, { async: true });
    context.prerequisites = await foundry.applications.ux.TextEditor.enrichHTML(this.document.system.prerequisites, {
      async: true,
    });

    context.ammunition = this.document.actor?.itemTypes?.ammunition ?? [];

    context.displaySecondaryAxiomValue =
      !this.document.system?.secondaryAxiom ||
        this.document.system?.secondaryAxiom.selected === 'none'
        ? false
        : true;

    context.ignoreAmmo = game.settings.get('torgeternity', 'ignoreAmmo');

    // tabs?
    if (!this.tabGroups.primary) this.tabGroups.primary = 'stats';
    switch (this.item.type) {
      case 'perk':
        if (this.item.system.extendedNav)
          context.tabs = {
            stats: { group: "primary", id: "stats" },
            enhancements: { group: "primary", id: "enhancements", label: 'torgeternity.sheetLabels.enhancements' },
            limitations: { group: "primary", id: "limitations", label: 'torgeternity.sheetLabels.limitations' },
            effects: { group: "primary", id: "effects" },
          };
        else
          context.tabs = {
            stats: { group: "primary", id: "stats" },
            effects: { group: "primary", id: "effects" },
          };
        break;
      default:
        context.tabs = {
          stats: { group: "primary", id: "stats" },
          effects: { group: "primary", id: "effects" },
        };
        break;
    }
    context.tabs[this.tabGroups.primary].cssClass = 'active';

    return context;
  }
}

/**
 * Reload a weapon with an actor's ammunition item
 *
 * @param {object} actor The actor who holds the weapon
 * @param {object} weapon The used weapon
 * @param {object} usedAmmo The Ammo that is used
 */
async function reloadAmmo(actor, weapon, usedAmmo) {
  if (weapon.system.ammo.value === weapon.system.ammo.max) {
    ChatMessage.create({
      content: `${game.i18n.format('torgeternity.chatText.ammoFull', { a: weapon.name })}`,
      speaker: ChatMessage.getSpeaker(),
    });
    return;
  }

  if (!usedAmmo) {
    // called from the main actor sheet, it's not known what ammo item is used.
    const ammoArray = [];
    for (const item of actor.items) {
      item.type === 'ammunition' && ammoArray.push(item);
    }
    if (ammoArray.length === 0) {
      ChatMessage.create({
        content: `${game.i18n.localize('torgeternity.chatText.noAmmoPosessing')}`,
        speaker: ChatMessage.getSpeaker(),
      });
      return;
    }

    if (ammoArray.length === 1) {
      usedAmmo = ammoArray[0];
    } else {
      let dialogContent =
        '<p>' +
        game.i18n.localize('torgeternity.dialogWindow.chooseAmmo.maintext') +
        '</p><form style="margin-bottom: 1rem"><div style="display:flex;flex-direction: column; list-style: none; align-items:center; gap=3px">';

      for (const ammo of ammoArray) {
        dialogContent += `<span><input id="${ammo.id}" name="chooseAmmoRdb" data-chosen-id="${ammo.id}" type="radio"/>
      <label for="${ammo.id}">${ammo.name}</label>
      </span>`;
      }

      dialogContent += '</form></div>';

      await Dialog.wait({
        title: game.i18n.localize('torgeternity.dialogWindow.chooseAmmo.windowTitle'),
        content: dialogContent,
        buttons: {
          ok: {
            label: `${game.i18n.localize('torgeternity.submit.OK')}`,
            callback: (html) => {
              const rdbElements = html[0].getElementsByTagName('input');
              for (const rdb of rdbElements) {
                if (rdb.checked) {
                  usedAmmo = actor.items.get(rdb.dataset.chosenId);
                  return;
                }
              }
            },
          },
          abort: {
            label: `${game.i18n.localize('torgeternity.submit.cancel')}`,
            callback: () => {
              return;
            },
          },
        },
        default: 'ok',
      });
    }
  }
  if (usedAmmo.system.quantity <= 0) {
    ui.notifications.error(game.i18n.localize('torgeternity.notifications.clipEmpty'));
    return;
  }
  await weapon.update({ 'system.ammo.value': weapon.system.ammo.max });

  await usedAmmo.update({ 'system.quantity': usedAmmo.system.quantity - 1 });

  await ChatMessage.create({
    content: game.i18n.format('torgeternity.chatText.reloaded', { a: weapon.name }),
    speaker: ChatMessage.getSpeaker(),
  });
}

export { reloadAmmo };
