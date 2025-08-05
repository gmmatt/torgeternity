import { onManageActiveEffect, prepareActiveEffectCategories } from '../effects.js';
const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export default class TorgeternityItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity', 'sheet', 'item', 'themed', 'theme-light'],
    window: {
      contentClasses: ['standard-form', 'scrollable'],
      resizable: true,
    },
    position: {
      width: 530,
      height: 580,
    },
    form: {
      submitOnChange: true
    },
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
      toggleTraitEdit: TorgeternityItemSheet.#onToggleTraitEdit,
    },
  }

  static PARTS = {
    header: { template: 'systems/torgeternity/templates/items/item-header.hbs' },
    tabs: { template: 'templates/generic/tab-navigation.hbs' },
    effects: { template: 'systems/torgeternity/templates/parts/active-effects.hbs', scrollable: [".scrollable"] },

    // same order as in system.json
    ammunition: { template: `systems/torgeternity/templates/items/ammunition-sheet.hbs`, scrollable: [".scrollable"] },
    armor: { template: `systems/torgeternity/templates/items/armor-sheet.hbs`, scrollable: [".scrollable"] },
    customAttack: { template: `systems/torgeternity/templates/items/customAttack-sheet.hbs`, scrollable: [".scrollable"] },
    customSkill: { template: `systems/torgeternity/templates/items/customSkill-sheet.hbs`, scrollable: [".scrollable"] },
    enhancement: { template: `systems/torgeternity/templates/items/enhancement-sheet.hbs`, scrollable: [".scrollable"] },
    eternityshard: { template: `systems/torgeternity/templates/items/eternityshard-sheet.hbs`, scrollable: [".scrollable"] },
    firearm: { template: `systems/torgeternity/templates/items/firearm-sheet.hbs`, scrollable: [".scrollable"] },
    gear: { template: `systems/torgeternity/templates/items/gear-sheet.hbs`, scrollable: [".scrollable"] },
    heavyweapon: { template: `systems/torgeternity/templates/items/heavyweapon-sheet.hbs`, scrollable: [".scrollable"] },
    implant: { template: `systems/torgeternity/templates/items/implant-sheet.hbs`, scrollable: [".scrollable"] },
    meleeweapon: { template: `systems/torgeternity/templates/items/meleeweapon-sheet.hbs`, scrollable: [".scrollable"] },
    miracle: { template: `systems/torgeternity/templates/items/powers-sheet.hbs`, scrollable: [".scrollable"] },
    missileweapon: { template: `systems/torgeternity/templates/items/missileweapon-sheet.hbs`, scrollable: [".scrollable"] },
    perk: { template: `systems/torgeternity/templates/items/perk-sheet.hbs`, scrollable: [".scrollable"] },
    perkEnhancements: { template: `systems/torgeternity/templates/items/perk-enhancements-sheet.hbs`, scrollable: [".scrollable"] },
    perkLimitations: { template: `systems/torgeternity/templates/items/perk-limitations-sheet.hbs`, scrollable: [".scrollable"] },
    psionicpower: { template: `systems/torgeternity/templates/items/powers-sheet.hbs`, scrollable: [".scrollable"] },
    race: { template: `systems/torgeternity/templates/items/race-sheet.hbs`, scrollable: [".scrollable"] },
    shield: { template: `systems/torgeternity/templates/items/shield-sheet.hbs`, scrollable: [".scrollable"] },
    specialability: { template: `systems/torgeternity/templates/items/specialability-sheet.hbs`, scrollable: [".scrollable"] },
    ["specialability-rollable"]: { template: `systems/torgeternity/templates/items/specialability-rollable-sheet.hbs`, scrollable: [".scrollable"] },
    spell: { template: `systems/torgeternity/templates/items/powers-sheet.hbs`, scrollable: [".scrollable"] },
    vehicle: { template: `systems/torgeternity/templates/items/vehicle-sheet.hbs`, scrollable: [".scrollable"] },
    vehicleAddOn: { template: `systems/torgeternity/templates/items/vehicleAddOn-sheet.hbs`, scrollable: [".scrollable"] },

    // not valid Item.type
    racePerks: { template: `systems/torgeternity/templates/items/race-perks-sheet.hbs`, scrollable: [".scrollable"] }, // TODO
  };

  static TABS = {
    primary: {
      tabs: [
        { id: 'stats' },
        { id: 'perkEnhancements' },  // perks only
        { id: 'perkLimitations' },   // perks only
        { id: 'racePerks' },   // perks only
        { id: 'effects' },
      ],
      initial: 'stats',
      labelPrefix: 'torgeternity.sheetLabels'
    }
  }

  get title() {
    return `${game.i18n.localize(CONFIG.Item.typeLabels[this.item.type])}: ${this.item.name}`
  }

  /** @inheritdoc */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable && this.item.type === 'race';
  }

  /** @inheritdoc */
  async _onDragStart(event) {
    const target = event.currentTarget;
    if (target.dataset.effectUuid) {
      const effect = await fromUuid(target.dataset.effectUuid);
      return event.dataTransfer.setData("text/plain", JSON.stringify(effect.toDragData()));
    } else
      return super._onDragStart(event);
  }

  /** @inheritdoc */
  async _onDrop(event) {
    // Note, Item#_onDrop does not exist
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const droppedDocument = await fromUuid(data.uuid);
    if (!droppedDocument || this.item.type !== 'race') return;

    if (droppedDocument.type === 'perk')
      return this.dropPerkOnRace(droppedDocument);
    else if (droppedDocument.type === 'customAttack')
      return this.dropAttackOnRace(droppedDocument);
  }

  async dropPerkOnRace(perk) {
    if (perk.system.category !== 'racial') {
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
  async _onRender(context, options) {
    await super._onRender(context, options);

    new foundry.applications.ux.DragDrop.implementation({
      dragSelector: '[data-drag], .item-list .item',
      permissions: {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      },
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        drop: this._onDrop.bind(this),
      }
    }).bind(this.element);

    this.element.querySelectorAll('nav').forEach(nav => nav.classList.add("right-tab"));
  }

  /**
   * Only triggered when the window is first rendered.
   * @param {*} context 
   * @param {*} options 
   */
  async _onFirstRender(context, options) {
    // When the window is first opened, collapse the traits editor
    const toggleButton = this.element.querySelector('a.toggleTraits');
    if (toggleButton) TorgeternityItemSheet.#onToggleTraitEdit.call(this, null, toggleButton);
    return super._onFirstRender(context, options);
  }

  /**
   * Actions
   * @param {} event 
   * @param {*} button 
   */
  static #onEffectControl(event, button) {
    onManageActiveEffect(event, button, this.document);
  }

  static #onConvertRsa(event, button) {
    this.item.update({
      type: 'specialability-rollable',
      "==system": this.item.system
    });
  }

  static #onAddEnhancement(event, button) {
    const currentShown = this.document.system.pulpPowers.enhancementNumber;
    const newShown = currentShown < 15 ? currentShown + 1 : currentShown;
    this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
  }


  static #onRemoveEnhancement(event, button) {
    const currentShown = this.document.system.pulpPowers.enhancementNumber;
    const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
    this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
  }

  static #onAddLimitation(event, button) {
    const currentShown = this.document.system.pulpPowers.limitationNumber;
    const newShown = currentShown < 10 ? currentShown + 1 : currentShown;
    this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
  }

  static #onRemoveLimitation(event, button) {
    const currentShown = this.document.system.pulpPowers.limitationNumber;
    const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
    this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
  }

  static async #onReloadWeapon(event, button) {
    const item = button.closest('[data-item-id]');
    const usedAmmo = this?.actor.items.get(item.dataset.itemId);
    await reloadAmmo(this.actor, this.item, usedAmmo, this);
  }

  static #onSelectSecondaryAxiom(event, button) {
    button.value === 'none' &&
      this.item.update({ 'system.secondaryAxiom.value': null });
  }

  static #onToggleTraitEdit(event, button) {
    const traits = button.parentElement.querySelectorAll('string-tags input, string-tags button, multi-select select');
    if (!traits) return;
    const hidden = !traits[0].disabled;
    for (const elem of traits) elem.disabled = hidden;
    button.classList.remove('fa-square-caret-up', 'fa-square-caret-down');
    button.classList.add(hidden ? 'fa-square-caret-down' : 'fa-square-caret-up');
  }

  static #onItemName(event, button) {
    const section = button.closest('.item');
    const detail = section.querySelector('.item-detail');
    if (!detail) return;
    detail.style.display =
      detail.style.display === 'none' || !detail.style.display
        ? 'block' : 'none';
  }

  static #onItemDelete(event, button) {
    if (this.item.type === 'race') {
      const inheritedType = button.closest('.item').dataset.inheritedtype;
      const id = button.closest('.item').dataset.itemid;
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
    this.options.classes.push(this.item.type);

    // Decide which tabs are required
    switch (this.document.type) {
      case 'perk':
        options.parts = ['header', 'tabs', 'perk', 'perkEnhancements', 'perkLimitations', 'effects'];
        break;
      case 'race':
        options.parts = ['header', 'tabs', 'race', 'racePerks'];
        break;
      default:
        options.parts = ['header', 'tabs', this.document.type, 'effects'];
        break;
    }

    // On first render, set the height
    if (options.isFirstRender) {
      switch (this.document.type) {
        case 'firearm':
        case 'missileweapon':
          options.position.height = 850;
          break;
        case 'heavyweapon':
          options.position.height = 730;
          break;
        case 'meleeweapon':
          options.position.height = 675;
          break;
        case 'miracle':
        case 'psionicpower':
        case 'spell':
          options.position.height = 780;
          break;
        case 'specialability':
          options.position.width = 435;
          options.position.height = 585;
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
          options.position.height = 665;
          break;
        case 'customAttack':
          options.position.height = 675;
          break;
        case 'vehicleAddOn':
          options.position.height = 620;
          options.position.width = 465;
          break;
        case 'perk':
        default:
          options.position.height = 600;
      }
    }
  }

  async _preparePartContext(partId, context, options) {
    const partContext = await super._preparePartContext(partId, context, options);
    //partContext.partId = `${this.id}-${partId}`;
    if (partId === this.item.type)
      partContext.tab = partContext.tabs.stats;   // so template can access tab.cssClass
    else
      partContext.tab = partContext.tabs[partId];   // so template can access tab.cssClass
    return partContext;
  }
  /**
   *
   * @param options
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.systemFields = context.document.system.schema.fields;

    context.effects = prepareActiveEffectCategories(this.document.effects);
    context.item = context.document;
    context.typeLabel = game.i18n.localize(CONFIG.Item.typeLabels[context.document.type]);

    context.config = CONFIG.torgeternity;

    context.description = await foundry.applications.ux.TextEditor.enrichHTML(this.document.system.description);
    context.prerequisites = await foundry.applications.ux.TextEditor.enrichHTML(this.document.system.prerequisites);

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
            stats: { group: "primary", id: "stats", label: 'torgeternity.sheetLabels.stats' },
            perkEnhancements: { group: "primary", id: "perkEnhancements", label: 'torgeternity.sheetLabels.enhancements', style: "font-size:10px" },
            perkLimitations: { group: "primary", id: "perkLimitations", label: 'torgeternity.sheetLabels.limitations' },
            effects: { group: "primary", id: "effects", label: 'torgeternity.sheetLabels.effects' },
          };
        else
          context.tabs = {
            stats: { group: "primary", id: "stats", label: 'torgeternity.sheetLabels.stats' },
            effects: { group: "primary", id: "effects", label: 'torgeternity.sheetLabels.effects' },
          };
        break;
      case 'race':
        context.tabs = {
          stats: { group: "primary", id: "stats", label: 'torgeternity.sheetLabels.stats' },
          racePerks: { group: "primary", id: "racePerks", label: 'torgeternity.sheetLabels.racialPerks' },
        }
        break;
      default:
        context.tabs = {
          stats: { group: "primary", id: "stats", label: 'torgeternity.sheetLabels.stats' },
          effects: { group: "primary", id: "effects", label: 'torgeternity.sheetLabels.effects' },
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

      await DialogV2.confirm({
        window: { title: 'torgeternity.dialogWindow.chooseAmmo.windowTitle' },
        content: dialogContent,
        yes: {
          label: `${game.i18n.localize('torgeternity.submit.OK')}`,
          default: true,
          callback: (event, button, dialog) => {
            const checked = dialog.element.querySelector('input:checked');
            if (checked) usedAmmo = actor.items.get(checked.dataset.chosenId);
          },
        },
        no: {
          label: `${game.i18n.localize('torgeternity.submit.cancel')}`,
        },
      });
    }
  }
  // Maybe no selection made
  if (!usedAmmo) return;

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
