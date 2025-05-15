import { onManageActiveEffect, prepareActiveEffectCategories } from '../effects.js';

/**
 *
 */
export default class TorgeternityItemSheet extends foundry.appv1.sheets.ItemSheet {
  /**
   *
   * @param {...any} args
   */
  constructor(...args) {
    super(...args);

    switch (this.object.type) {
      case 'firearm':
        this.options.height = this.position.height = 710;
        break;
      case 'heavyweapon':
        this.options.height = this.position.height = 730;
        break;
      case 'meleeweapon':
        this.options.height = this.position.height = 675;
        break;
      case 'missileweapon':
        this.options.height = this.position.height = 710;
        break;
      case 'miracle':
      case 'psionicpower':
      case 'spell':
        this.options.height = this.position.height = 780;
        break;
      case 'specialability':
        this.options.width = this.position.width = 435;
        this.options.height = this.position.height = 550;
        break;
      case 'specialability-rollable':
        this.options.height = this.position.height = 625;
        break;
      case 'vehicle':
        this.options.height = this.position.height = 630;
        break;
      case 'implant':
      case 'armor':
      case 'shield':
        this.options.height = this.position.height = 615;
        break;
      case 'customAttack':
        this.options.height = this.position.height = 675;
        break;
      case 'vehicleAddOn':
        this.options.height = this.position.height = 620;
        this.options.width = this.position.width = 465;
        break;
      default:
        this.options.height = this.position.height = 560;
    }
  }

  /**
   *
   */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 530,
      height: 580,
      classes: ['torgeternity', 'sheet', 'item'],
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'stats',
        },
      ],
      dragDrop: [
        {
          dragSelector: '.item-list .item',
          dropSelector: null,
        },
      ],
      scrollY: ['.stats', '.effects', '.background'],
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

  _onDrag(event) {
    console.log(event);
  }

  /** @inheritdoc */
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
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
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.effect-control').click((ev) => {
      if (this.item.isOwned)
        return ui.notifications.warn(
          game.i18n.localize('torgeternity.notifications.noActiveEffectInOwnedItem')
        );
      onManageActiveEffect(ev, this.item);
    });

    html.find('.convert-rsa').click((ev) => {
      this.item.update({
        type: 'specialability-rollable',
      });
    });

    html.find('.add-enhancement').click((ev) => {
      const currentShown = this.object.system.pulpPowers.enhancementNumber;
      const newShown = currentShown < 15 ? currentShown + 1 : currentShown;
      this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
    });

    html.find('.remove-enhancement').click((ev) => {
      const currentShown = this.object.system.pulpPowers.enhancementNumber;
      const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
      this.item.update({ 'system.pulpPowers.enhancementNumber': newShown });
    });

    html.find('.add-limitation').click((ev) => {
      const currentShown = this.object.system.pulpPowers.limitationNumber;
      const newShown = currentShown < 10 ? currentShown + 1 : currentShown;
      this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
    });

    html.find('.remove-limitation').click((ev) => {
      const currentShown = this.object.system.pulpPowers.limitationNumber;
      const newShown = 0 < currentShown ? currentShown - 1 : currentShown;
      this.item.update({ 'system.pulpPowers.limitationNumber': newShown });
    });

    html.find('.reload-weapon').click(async (ev) => {
      const button = ev.currentTarget.closest('[data-item-id]');
      const usedAmmo = this?.actor.items.get(button.dataset.itemId);

      await reloadAmmo(this.actor, this.object, usedAmmo, this);
      this.render(true);
    });

    html.find('.selectSecondaryAxiom').click((ev) => {
      ev.currentTarget.value === 'none' &&
        this.item.update({ 'system.secondaryAxiom.value': null });
    });

    html.find('.item-name').click((ev) => {
      const section = ev.currentTarget.closest('.item');
      const detail = $(section).find('.item-detail').get(0);

      if (!detail) return;
      detail.style.display =
        detail.style.display === 'none' || !detail.style.display
          ? (detail.style.display = 'block')
          : (detail.style.display = 'none');
    });

    html.find('.item-control.item-delete').click((ev) => {
      if (this.item.type === 'race') {
        const inheritedType = $(ev.currentTarget.closest('.item')).attr('data-inheritedType');
        const id = $(ev.currentTarget.closest('.item')).attr('data-item-id');
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
    });
  }

  /**
   *
   */
  get template() {
    return `systems/torgeternity/templates/sheets/${this.item.type}-sheet.html`;
  }

  /**
   *
   * @param options
   */
  async getData(options) {
    const data = await super.getData(options);

    data.effects = prepareActiveEffectCategories(this.document.effects);

    data.config = CONFIG.torgeternity;

    data.description = await TextEditor.enrichHTML(this.object.system.description, { async: true });
    data.prerequisites = await TextEditor.enrichHTML(this.object.system.prerequisites, {
      async: true,
    });

    data.ammunition = this.document.actor?.itemTypes?.ammunition ?? [];

    data.displaySecondaryAxiomValue =
      !this.document.system?.secondaryAxiom ||
      this.document.system?.secondaryAxiom.selected === 'none'
        ? false
        : true;

    return data;
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
