import { onManageActiveEffect, prepareActiveEffectCategories } from '../effects.js';

/**
 *
 */
export default class TorgeternityItemSheet extends ItemSheet {
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
      scrollY: ['.stats', '.effects', '.background'],
      dragdrop: [
        {
          dragSelector: '.item-list .item',
          dropSelector: null,
        },
      ],
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

    return data;
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
  }
}
