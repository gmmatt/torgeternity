import { renderSkillChat } from '../torgchecks.js';
import { onManageActiveEffect, prepareActiveEffectCategories } from '../effects.js';
import { oneTestTarget, TestDialog } from '../test-dialog.js';
import TorgeternityItem from '../documents/item/torgeternityItem.js';
import { reloadAmmo } from './torgeternityItemSheet.js';
import { PossibilityByCosm } from '../possibilityByCosm.js';
import { ChatMessageTorg } from '../documents/chat/document.js';

const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export default class TorgeternityActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity', 'sheet', 'actor', 'themed', 'theme-light'],
    window: {
      contentTag: 'div',
      contentClasses: ['standard-form'],
      resizable: true,
    },
    position: {
      width: 770,
      height: 860,
    },
    form: {
      submitOnChange: true
    },
    actions: {
      skillList: TorgeternityActorSheet.#onSkillList,
      skillRoll: TorgeternityActorSheet.#onSkillRoll,
      skillElementRoll: TorgeternityActorSheet.#onSkillElementRoll,
      skillEditToggle: TorgeternityActorSheet.#onSkillEditToggle,
      itemToChat: TorgeternityActorSheet.#onItemChat,
      itemAttackRoll: TorgeternityActorSheet.#onAttackRoll,
      interactionAttack: TorgeternityActorSheet.#onInteractionAttack,
      unarmedAttack: TorgeternityActorSheet.#onUnarmedAttack,
      itemPowerRoll: TorgeternityActorSheet.#onPowerRoll,
      itemEquip: TorgeternityActorSheet.#onItemEquip,
      itemCreateSa: TorgeternityActorSheet.#onCreateSa,
      itemCreateRsa: TorgeternityActorSheet.#onCreateSaR,
      activeDefenseRoll: TorgeternityActorSheet.#onActiveDefenseRoll,
      activeDefenseRollGlow: TorgeternityActorSheet.#onActiveDefenseCancel,
      effectControl: TorgeternityActorSheet.#onManageActiveEffect, // data-action already on relevant elements
      chaseRoll: TorgeternityActorSheet.#onChaseRoll,
      stuntRoll: TorgeternityActorSheet.#onStuntRoll,
      baseRoll: TorgeternityActorSheet.#onBaseRoll,
      applyFatigue: TorgeternityActorSheet.#onApplyFatigue,
      changeAttributesToggle: TorgeternityActorSheet.#onChangeAttributesToggle,
      increaseAttribute: TorgeternityActorSheet.#onIncreaseAttribute,
      decreaseAttribute: TorgeternityActorSheet.#onDecreaseAttribute,
      openHand: TorgeternityActorSheet.#onOpenHand,
      openPoss: TorgeternityActorSheet.#onCosmPoss,
      itemEdit: TorgeternityActorSheet.#onItemEdit,
      itemDelete: TorgeternityActorSheet.#onItemDelete,
      reloadWeapon: TorgeternityActorSheet.#onReloadWeapon,
      itemName: TorgeternityActorSheet.#onitemName,
      deleteRaceButton: TorgeternityActorSheet.#onDeleteRaceButton,
    }
  }

  static PARTS = {
    tabs: { template: 'templates/generic/tab-navigation.hbs' },

    title: { template: "systems/torgeternity/templates/actors/stormknight/title.hbs" },
    stats: { template: "systems/torgeternity/templates/actors/stormknight/stats-details.hbs", scrollable: [""] },
    perks: { template: "systems/torgeternity/templates/actors/stormknight/perks-details.hbs", scrollable: [""] },
    gear: { template: "systems/torgeternity/templates/actors/stormknight/gear.hbs", scrollable: [""] },
    powers: { template: "systems/torgeternity/templates/actors/stormknight/powers.hbs", scrollable: [""] },
    effects: { template: "systems/torgeternity/templates/parts/active-effects.hbs", scrollable: [""] },
    background: { template: "systems/torgeternity/templates/actors/stormknight/background.hbs", scrollable: [""] },

    threat: { template: `systems/torgeternity/templates/actors/threat/main.hbs`, scrollable: [".scrollable"] },
    vehicle: { template: `systems/torgeternity/templates/actors/vehicle/main.hbs`, scrollable: [".scrollable"] }
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'stats', },
        { id: 'perks', },
        { id: 'gear', },
        { id: 'powers', },
        { id: 'effects', },
        { id: 'background', label: 'torgeternity.sheetLabels.notes' },
      ],
      initial: "stats",
      labelPrefix: 'torgeternity.sheetLabels'
    },
    vehicle: {
      tabs: [
        { id: 'stats', },
        { id: 'gear', },
        { id: 'effects', },
        { id: 'background', label: 'torgeternity.sheetLabels.notes' },
      ],
      initial: "stats",
      labelPrefix: 'torgeternity.sheetLabels'
    }
  }

  /**
   *
   * @param {...any} args
   */
  constructor(options = {}) {
    super(options);

    this._filters = { effects: new Set() };
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    this.options.classes.push(this.actor.type);

    switch (this.actor.type) {
      case 'stormknight':
        options.parts = ['title', 'tabs', 'stats', 'perks', 'gear', 'powers', 'effects', 'background'];
        break;
      case 'vehicle':
        options.parts = [this.actor.type];
        break;
      case 'threat':
        options.parts = [this.actor.type];
        if (options.isFirstRender) {
          options.position.width = 690;
          options.position.height = 645;
        }
        break;
    }
  }

  async _preparePartContext(partId, context, options) {
    const partContext = await super._preparePartContext(partId, context, options);
    if (partId in partContext.tabs) partContext.tab = partContext.tabs[partId];
    return partContext;
  }

  /**
   * @param options
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.tabs = this._prepareTabs((this.actor.type === 'vehicle') ? 'vehicle' : 'primary');
    context.systemFields = context.document.system.schema.fields;
    context.items = Array.from(context.document.items);
    context.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));

    context.meleeweapons = context.items.filter(item => item.type === 'meleeweapon');
    context.customAttack = context.items.filter(item => item.type === 'customAttack');
    context.customSkill = context.items.filter(item => item.type === 'customSkill');
    context.gear = context.items.filter(item => item.type === 'gear');
    context.eternityshard = context.items.filter(item => item.type === 'eternityshard');
    context.armor = context.items.filter(item => item.type === 'armor');
    context.shield = context.items.filter(item => item.type === 'shield');
    context.missileweapon = context.items.filter(item => item.type === 'missileweapon');
    context.firearm = context.items.filter(item => item.type === 'firearm');
    context.implant = context.items.filter(item => item.type === 'implant');
    context.heavyweapon = context.items.filter(item => item.type === 'heavyweapon');
    context.vehicle = context.items.filter(item => item.type === 'vehicle');
    context.perk = context.items.filter(item => item.type === 'perk');
    context.spell = context.items.filter(item => item.type === 'spell');
    context.miracle = context.items.filter(item => item.type === 'miracle');
    context.psionicpower = context.items.filter(item => item.type === 'psionicpower');
    context.specialability = context.items.filter(item => item.type === 'specialability');
    context.specialabilityRollable = context.items.filter(item => item.type === 'specialability-rollable');
    context.enhancement = context.items.filter(item => item.type === 'enhancement');
    context.dramaCard = context.items.filter(item => item.type === 'dramaCard');
    context.destinyCard = context.items.filter(item => item.type === 'destinyCard');
    context.cosmCard = context.items.filter(item => item.type === 'cosmCard');
    context.vehicleAddOn = context.items.filter(item => item.type === 'vehicleAddOn');
    context.ammunitions = context.items.filter(item => item.type === 'ammunition');

    for (const type of [
      'meleeweapons',
      'customAttack',
      'customSkill',
      'gear',
      'eternityshard',
      'armor',
      'shield',
      'missileweapon',
      'firearm',
      'implant',
      'heavyweapon',
      'vehicle',
      'perk',
      'spell',
      'miracle',
      'psionicpower',
      'specialability',
      'specialabilityRollable',
      'enhancement',
      'dramaCard',
      'destinyCard',
      'cosmCard',
      'vehicleAddOn',
    ]) {
      for (const item of context[type]) {
        item.description = await foundry.applications.ux.TextEditor.enrichHTML(item.system.description);
      }
    }

    // Enrich Text Editors
    switch (this.actor.type) {
      case 'stormknight':
        context.enrichedBackground = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.details.background);
        break;
      case 'threat':
        context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.details.description);
        break;
      case 'vehicle':
        context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.description);
    }

    // if (this.actor.system.editstate === undefined) 
    //        this.actor.system.editstate = "none";

    context.effects = prepareActiveEffectCategories(this.actor.allApplicableEffects());

    context.config = CONFIG.torgeternity;
    context.disableXP = true;
    if (game.user.isGM || !game.settings.get('torgeternity', 'disableXP')) {
      context.disableXP = false;
    }

    // is the actor actively defending at the moment?
    context.document.defenses.isActivelyDefending = this.actor.effects.find(
      (e) => e.name === 'ActiveDefense'
    )
      ? true
      : false;

    context.ignoreAmmo = game.settings.get('torgeternity', 'ignoreAmmo');

    return context;
  }

  _onDragStart(event) {
    if (event.target.classList.contains('skill-roll'))
      this._skillAttrDragStart(event) // a.skill-roll
    else if (event.target.classList.contains('interaction-attack'))
      this._interactionDragStart(event) // a.interaction-attack
    else
      super._onDragStart(event) // a.item-name, threat: a.item
  }

  // Skills are not Foundry "items" with IDs, so the skill data is not automatically
  //    inserted by Foundry's _onDragStart. Instead we call that function because it
  //    does some needed work and then add in the skill data in a way that will be
  //    retrievable when the skill is dropped on the macro bar.
  /**
   *
   * @param event
   */
  _skillAttrDragStart(event) {
    const skillAttrData = {
      type: event.target.dataset.testtype,
      data: {
        name: event.target.dataset.name,
        attribute: event.target.dataset.baseattribute,
        adds: event.target.dataset.adds,
        value: event.target.dataset.value,
        unskilledUse: event.target.dataset.unskilleduse,
        attackType: '',
        DNDescriptor: 'standard',
        rollTotal: 0,
      },
    };
    event.dataTransfer.setData('text/plain', JSON.stringify(skillAttrData));
  }

  // See _skillAttrDragStart above.
  /**
   *
   * @param event
   */
  _interactionDragStart(event) {
    const skillNameKey = event.target.dataset.name;
    const skill = this.actor.system.skills[skillNameKey];
    const value = skill.value || (skill.adds + this.actor.system.attributes[skill.baseAttribute].value);
    const skillAttrData = {
      type: 'interaction',
      data: {
        name: skillNameKey,
        attribute: skill.baseAttribute,
        adds: skill.adds,
        value: value,
        unskilledUse: skill.unskilledUse,
        attackType: event.target.dataset.attackType.value,
      },
    };
    event.dataTransfer.setData('text/plain', JSON.stringify(skillAttrData));
  }

  /**
   *
   * @param html
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    let html = this.element;

    html.querySelectorAll('nav').forEach(nav => nav.classList.add("right-tab"));

    new foundry.applications.ux.DragDrop.implementation({
      dragSelector: '[data-drag], .item-list .item',
      callbacks: {
        dragstart: this._onDragStart.bind(this),
        drop: this._onDrop.bind(this),
      }
    }).bind(this.element);

    // localizing hardcoded possibility potential value
    if (this.actor.isOwner) {
      html.querySelectorAll('.attributeValueField').forEach(elem =>
        elem.addEventListener('change', event => {
          const concernedAttribute = target.dataset.baseattributeinput;
          this.actor.update({ [`system.attributes.${concernedAttribute}.base`]: parseInt(target.value) });
        }));
    }

    // Everything below here is only needed if the sheet is editable
    if (!context.editable) return;

    // compute adds from total for threats
    if (this.actor.type == 'threat') {
      html.querySelectorAll('.skill-element-edit .inputsFav').forEach(elem =>
        elem.addEventListener('change', ev => this.#setThreatAdds.bind(this)));
    }
  }

  /** @inheritdoc */
  async _onDrop(event) {
    if (this.actor.type !== 'stormknight') {
      await super._onDrop(event);
      return;
    }
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const droppedDocument = await fromUuid(data.uuid);
    if (droppedDocument instanceof TorgeternityItem && droppedDocument.type === 'race') {
      const raceItem = this.actor.items.find(item => item.type === 'race');
      if (raceItem) {
        await this.actor.deleteEmbeddedDocuments('Item', [
          raceItem.id,
          ...this.actor.items
            .filter(item => item.type === 'perk' && item.system.category === 'racial')
            .map(item => item.id),
        ]);
      }
      await super._onDrop(event);

      await this.actor.createEmbeddedDocuments('Item', [...droppedDocument.system.perksData]);

      await this.actor.createEmbeddedDocuments('Item', [...droppedDocument.system.customAttackData]);

      for (const [key, value] of Object.entries(droppedDocument.system.attributeMaximum)) {
        if (this.actor.system.attributes[key].base <= value) continue;

        const proceed = await DialogV2.confirm({
          window: { title: 'torgeternity.dialogWindow.raceDiminishAttribute.title' },
          content: await game.i18n.format(
            'torgeternity.dialogWindow.raceDiminishAttribute.maintext',
            { attribute: await game.i18n.localize('torgeternity.attributes.' + key), }
          ),
          rejectClose: false,
          modal: true,
        });
        if (!proceed) continue;

        await this.actor.update({ [`system.attributes.${key}.base`]: value });
      }
      await this.actor.update({ 'system.details.sizeBonus': droppedDocument.system.size });

      if (droppedDocument.system.darkvision)
        await this.actor.update({ 'prototypeToken.sight.visionMode': 'darkvision' });
    } else {
      await super._onDrop(event);
    }
  }

  /**
   *
   * @param event
   */
  async #setThreatAdds(event) {
    const skill = event.target.dataset.skill;

    if (['0', ''].includes(event.target.value)) {
      // reset the 'skill object' to hide any value (the zero)
      await this.actor.update({
        [`system.skills.${skill}.adds`]: '',
        [`system.skills.${skill}.value`]: '',
        [`system.skills.${skill}.isThreatSkill`]: false,
      });
    } else if (skill) {
      const skillObject = this.actor.system.skills[skill];
      const computedAdds = event.target?.value - this.actor.system.attributes[skillObject?.baseAttribute].value;
      await this.actor.update({
        [`system.skills.${skill}.adds`]: computedAdds,
        [`system.skills.${skill}.isThreatSkill`]: true,
      });

    }
  }

  /**
   *
   * @param event
   */
  static async #onOpenHand(event, button) {
    const characterHand = this.actor.getDefaultHand();
    // if default hand => render it
    if (characterHand) {
      characterHand.sheet.render(true);
    } else {
      await this.actor.createDefaultHand();
      characterHand.sheet.render(true);
    }
  }

  /**
   *
   * @param event
   */
  static async #onCosmPoss(event, button) {
    const actor = this.actor;
    const window = Object.values(ui.windows).find(
      (w) => w.title === game.i18n.localize('torgeternity.sheetLabels.possibilityByCosm')
    );
    if (!window) {
      PossibilityByCosm.create(actor);
    }
  }

  /**
   *
   * @param event
   */
  static async #onSkillList(event, button) {
    const skillName = button.dataset.name;
    const isThreatSkill = this.actor.system.skills[skillName]?.isThreatSkill;
    const update = { [`system.skills.${skillName}.isThreatSkill`]: !isThreatSkill };
    if (isThreatSkill) {
      update[`system.skills.${skillName}.adds`] = '';
    }
    await this.actor.update(update);
  }

  /**
   *
   * @param event
   */
  static async #onSkillRoll(event, button) {
    const skillName = button.dataset.name;
    const attributeName = button.dataset.baseattribute;
    const skillValue = button.dataset.value;

    // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
    if (checkUnskilled(skillValue, skillName, this.actor)) return;

    // Check if character is trying to roll on reality while disconnected- must be allowed if reconnection-roll
    if (skillName === 'reality' && this.actor.isDisconnected) {
      const confirmed = await DialogV2.confirm({
        window: { title: game.i18n.localize('torgeternity.dialogWindow.realityCheck.title') },
        content: game.i18n.localize('torgeternity.dialogWindow.realityCheck.content'),
      });

      if (!confirmed) {

        foundry.applications.handlebars.renderTemplate(
          './systems/torgeternity/templates/chat/skill-error-card.hbs',
          {
            message: game.i18n.localize('torgeternity.chatText.check.cantUseRealityWhileDisconnected'),
            actorPic: this.actor.img,
            actorName: this.actor.name,
          }
        ).then(content =>
          ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            owner: this.actor,
            content: content
          })
        )
        return;
      }
    }

    new TestDialog({
      testType: button.dataset.testtype,
      customSkill: button.dataset.customskill,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isFav:
        this.actor.system.skills[skillName]?.isFav ||
        this.actor.system.attributes?.[skillName + 'IsFav'] ||
        button.dataset.isfav,
      skillName: (button.dataset.testtype === 'attribute') ? attributeName : skillName,
      skillValue: skillValue,
      rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  // Adapted from above, with event targetting in edit skills list
  /**
   *
   * @param event
   */
  static async #onSkillElementRoll(event, button) {
    const skillName = button.dataset.name;
    const attributeName = button.dataset.baseattribute;
    const isUnskilledTest = button.dataset.unskilleduse === '0';
    const skillValue =
      button.dataset.value === 'NaN'
        ? isUnskilledTest
          ? '-'
          : this.actor.system.attributes[attributeName].value
        : button.dataset.value;

    // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
    if (checkUnskilled(skillValue, skillName, this.actor)) return;

    new TestDialog({
      testType: button.dataset.testtype,
      customSkill: button.dataset.customskill,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isFav:
        this.actor.system.skills[skillName]?.isFav ||
        this.actor.system.attributes?.[skillName + 'IsFav'] ||
        !!button.dataset.isfav,
      skillName: skillName,
      skillValue: skillValue,
      rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static async #onChaseRoll(event, button) {
    if (!game.combats.active) {
      ui.notifications.info(game.i18n.localize('torgeternity.chatText.check.noTracker'));
      return;
    }

    new TestDialog({
      testType: 'chase',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: 'vehicle',
      skillName: 'Vehicle Chase',
      skillValue: button.dataset.skillValue,
      DNDescriptor: 'highestSpeed',
      rollTotal: 0,
      vehicleSpeed: button.dataset.speed,
      maneuverModifier: button.dataset.maneuver,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static async #onBaseRoll(event, button) {
    new TestDialog({
      testType: 'vehicleBase',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: 'vehicle',
      skillName: 'Vehicle Operation',
      skillValue: button.dataset.skillValue,
      rollTotal: 0,
      vehicleSpeed: button.dataset.speed,
      maneuverModifier: button.dataset.maneuver,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static async #onStuntRoll(event, button) {
    const dnDescriptor = (game.user.targets.first()?.actor.type === 'vehicle')
      ? 'targetVehicleDefense' : 'standard';

    new TestDialog({
      testType: 'stunt',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: 'vehicle',
      skillName: 'Vehicle Stunt',
      skillValue: button.dataset.skillValue,
      DNDescriptor: dnDescriptor,
      rollTotal: 0,
      vehicleSpeed: button.dataset.speed,
      maneuverModifier: button.dataset.maneuver,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static #onInteractionAttack(event, button) {
    let dnDescriptor = 'standard';
    const attackType = button.dataset.attackType;
    if (game.user.targets.size) {
      switch (attackType) {
        case 'intimidation':
          dnDescriptor = 'targetIntimidation';
          break;
        case 'maneuver':
          dnDescriptor = 'targetManeuver';
          break;
        case 'taunt':
          dnDescriptor = 'targetTaunt';
          break;
        case 'trick':
          dnDescriptor = 'targetTrick';
          break;
        default:
          dnDescriptor = 'standard';
      }
    } else {
      dnDescriptor = 'standard';
    }

    new TestDialog({
      testType: 'interactionAttack',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      interactionAttackType: button.dataset.attackType,
      skillName: button.dataset.name,
      skillBaseAttribute: game.i18n.localize(
        'torgeternity.skills.' + button.dataset.baseAttribute
      ),
      skillAdds: button.dataset.adds,
      skillValue: button.dataset.skillValue,
      isFav: this.actor.system.skills[attackType].isFav,
      unskilledUse: true,
      DNDescriptor: dnDescriptor,
      type: 'interactionAttack',
      rollTotal: 0,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static #onUnarmedAttack(event, button) {
    let dnDescriptor = 'standard';
    if (game.user.targets.size) {
      const firstTarget = game.user.targets.find(token => token.actor.type !== 'vehicle')?.actor ||
        game.user.targets.first().actor;

      if (firstTarget.type === 'vehicle') {
        dnDescriptor = 'targetVehicleDefense';
      } else {
        firstTarget.items
          .filter((it) => it.type === 'meleeweapon')
          .filter((it) => it.system.equipped).length !== 0
          ? (dnDescriptor = 'targetMeleeWeapons')
          : (dnDescriptor = 'targetUnarmedCombat');
      }
    }

    const skillValue = isNaN(button.dataset.skillValue)
      ? this.actor.system.attributes.dexterity.value
      : button.dataset.skillValue;

    new TestDialog({
      testType: 'attack',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      amountBD: 0,
      isAttack: true,
      skillName: 'unarmedCombat',
      skillValue: skillValue,
      isFav: this.actor.system.skills.unarmedCombat.isFav,
      unskilledUse: true,
      damage: parseInt(button.dataset.damage),
      weaponAP: 0,
      applyArmor: true,
      DNDescriptor: dnDescriptor,
      type: 'attack',
      applySize: true,
      attackOptions: true,
      rollTotal: 0,
      bdDamageLabelStyle: 'dishiddene',
      bdDamageSum: 0,
      amountBD: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static #onSkillEditToggle(event, button) {
    event.preventDefault();
    const toggleState = this.actor.system.editstate;
    this.actor.update({ 'system.editstate': !toggleState });
  }

  /**
   *
   * @param event
   */
  static #onActiveDefenseRoll(event, button) {

    new TestDialog({
      testType: 'activeDefense',
      activelyDefending: false,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isActiveDefenseRoll: true,
      skillName: 'activeDefense',
      skillBaseAttribute: 0,
      skillAdds: null,
      skillValue: null,
      unskilledUse: true,
      type: 'activeDefense',
      rollTotal: 0,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static async #onActiveDefenseCancel(event, button) {

    await renderSkillChat({
      testType: 'activeDefense',
      activelyDefending: true,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      skillName: 'activeDefense',
      skillBaseAttribute: 0,
      skillAdds: null,
      skillValue: null,
      unskilledUse: true,
      darknessModifier: 0,
      DNDescriptor: 'standard',
      type: 'activeDefense',
      targetAll: game.user.targets.map(token => oneTestTarget(token)), // for renderSkillChat
      applySize: false,
      attackOptions: false,
      rollTotal: 0,
    });
  }

  /**
   *
   * @param event
   */
  static async #onItemChat(event, button) {
    const itemID = button.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      flags: {
        data: item,
        itemId: item.id,  // for Automated Animations module
        torgeternity: {
          template: TorgeternityItem.CHAT_TEMPLATE[item.type],
        }
      },
    };

    return ChatMessageTorg.create(chatData);
  }

  /**
   *
   * @param event
   */
  static #onAttackRoll(event, button) {
    const itemID = button.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
    const weaponData = item.system;
    const attackWith = weaponData.attackWith;
    let skillValue;
    let skillData;
    let attributes;

    if (item?.weaponWithAmmo && !item.hasAmmo && !game.settings.get('torgeternity', 'ignoreAmmo')) {
      ui.notifications.warn(game.i18n.localize('torgeternity.chatText.noAmmo'));
      return;
    }

    if (this.actor.type === 'vehicle') {
      skillValue = item.system.gunner.skillValue;
      attributes = 0;
    } else {
      skillData = this.actor.system.skills[attackWith];
      skillValue = skillData.value;
      attributes = this.actor.system.attributes;
      if (isNaN(skillValue)) {
        skillValue = skillData.unskilledUse ? attributes[skillData.baseAttribute].value : '-';
      }
    }

    if (checkUnskilled(skillValue, attackWith, this.actor)) return;

    let dnDescriptor = 'standard';

    if (game.user.targets.size) {
      const firstTarget = game.user.targets.find(token => token.actor.type !== 'vehicle')?.actor ||
        game.user.targets.first().actor;

      if (firstTarget.type === 'vehicle') {
        dnDescriptor = 'targetVehicleDefense';
      } else {
        switch (attackWith) {
          case 'meleeWeapons':
          case 'unarmedCombat':
            firstTarget.items
              .filter((it) => it.type === 'meleeweapon')
              .filter((it) => it.system.equipped).length === 0
              ? (dnDescriptor = 'targetUnarmedCombat')
              : (dnDescriptor = 'targetMeleeWeapons');
            break;
          case 'fireCombat':
          case 'energyWeapons':
          case 'heavyWeapons':
          case 'missileWeapons':
            dnDescriptor = 'targetDodge';
            break;
          default:
            dnDescriptor = 'targetMeleeWeapons';
        }
      }
    }

    // Calculate damage caused by this weapon
    let adjustedDamage = 0;
    const weaponDamage = weaponData.damage;
    switch (weaponData.damageType) {
      case 'flat':
        adjustedDamage = weaponDamage;
        break;
      case 'strengthPlus':
        adjustedDamage = attributes.strength.value + parseInt(weaponDamage);
        break;
      case 'charismaPlus':
        adjustedDamage = attributes.charisma.value + parseInt(weaponDamage);
        break;
      case 'dexterityPlus':
        adjustedDamage = attributes.dexterity.value + parseInt(weaponDamage);
        break;
      case 'mindPlus':
        adjustedDamage = attributes.mind.value + parseInt(weaponDamage);
        break;
      case 'spiritPlus':
        adjustedDamage = attributes.spirit.value + parseInt(weaponDamage);
        break;
      default:
        adjustedDamage = parseInt(weaponDamage);
    }

    new TestDialog({
      testType: 'attack',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      amountBD: 0,
      isAttack: true,
      isFav: skillData?.isFav || false,
      skillName: attackWith,
      skillValue: Math.max(skillValue, attributes[skillData?.baseAttribute]?.value || 0),
      unskilledUse: true,
      damage: adjustedDamage,
      weaponAP: weaponData.ap,
      applyArmor: true,
      DNDescriptor: dnDescriptor,
      type: 'attack',
      applySize: true,
      attackOptions: true,
      rollTotal: 0,
      chatNote: weaponData.chatNote,
      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
      itemId: item.id,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static #onPowerRoll(event, button) {
    const itemID = button.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
    const powerData = item.system;
    const skillName = powerData.skill;
    const skillData = this.actor.system.skills[skillName];

    // Set modifier for this power
    const powerModifier = item.system.modifier || 0;

    if (checkUnskilled(skillData.value, skillName, this.actor)) return;

    new TestDialog({
      testType: 'power',
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      powerName: item.name,
      powerModifier: powerModifier,
      isAttack: powerData.isAttack,
      isFav: skillData.isFav,
      skillName: skillName,
      skillBaseAttribute: game.i18n.localize('torgeternity.skills.' + button.dataset.baseAttribute),
      skillAdds: skillData.adds,
      skillValue: Math.max(skillData.value, this.actor.system.attributes[skillData.baseAttribute].value),
      unskilledUse: false,
      damage: powerData.damage,
      weaponAP: powerData.ap,
      applyArmor: powerData.applyArmor,
      DNDescriptor: powerData.dn,
      applySize: powerData.applySize,
      attackOptions: true,
      rollTotal: 0,
      bdDamageLabelStyle: 'dihiddene',
      amountBD: 0,
      bdDamageSum: 0,
      itemId: item.id,
    }, { useTargets: true });
  }

  /**
   *
   * @param event
   */
  static #onCreateSa(event, button) {
    event.preventDefault();
    const itemData = {
      name: game.i18n.localize('torgeternity.itemSheetDescriptions.specialability'),
      type: 'specialability',
    };
    return this.actor.createEmbeddedDocuments('Item', [itemData], {
      renderSheet: true,
    });
  }

  /**
   *
   * @param event
   */
  static #onCreateSaR(event, button) {
    event.preventDefault();
    const itemData = {
      name: game.i18n.localize('torgeternity.itemSheetDescriptions.specialabilityRollable'),
      type: 'specialability-rollable',
    };
    return this.actor.createEmbeddedDocuments('Item', [itemData], {
      renderSheet: true,
    });
  }

  /**
   *
   * @param event
   */
  static #onItemEquip(event, button) {
    const itemID = button.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
    TorgeternityItem.toggleEquipState(item, this.actor);
  }

  static #onManageActiveEffect(event, button) {
    onManageActiveEffect(event, button, this.actor);
  }

  static #onApplyFatigue(event, button) {
    const newShock = this.actor.system.shock.value + parseInt(button.dataset.fatigue);
    this.actor.update({ 'system.shock.value': newShock });
  }

  static #onChangeAttributesToggle(event, button) {
    this.actor.setFlag(
      'torgeternity',
      'editAttributes',
      !this.actor.getFlag('torgeternity', 'editAttributes')
    );
  }
  static #onIncreaseAttribute(event, button) {
    const concernedAttribute = button.dataset.concernedattribute;
    const attributeToChange = this.actor.system.attributes[concernedAttribute].base;
    this.actor.update({
      [`system.attributes.${concernedAttribute}.base`]: attributeToChange + 1,
    });
  }
  static #onDecreaseAttribute(event, button) {
    const concernedAttribute = button.dataset.concernedattribute;
    const attributeToChange = this.actor.system.attributes[concernedAttribute].base;
    this.actor.update({ [`system.attributes.${concernedAttribute}.base`]: attributeToChange - 1 });
  }
  static #onItemEdit(event, button) {
    const li = button.closest('.item');
    const item = this.actor.items.get(li.dataset.itemId);
    item.sheet.render(true);
  }
  static #onItemDelete(event, button) {
    return DialogV2.confirm({
      window: { title: 'torgeternity.dialogWindow.itemDeletion.title' },
      content: game.i18n.localize('torgeternity.dialogWindow.itemDeletion.content'),
      yes: {
        icon: 'fa-solid fa-check',
        label: 'torgeternity.yesNo.true',
        default: true,
        callback: () => {
          const li = button.closest('.item');
          this.actor.deleteEmbeddedDocuments('Item', [li.dataset.itemId])
        }
      },
      no: {
        icon: 'fa-solid fa-times',
        label: 'torgeternity.yesNo.false',
      },
    });
  }

  static #onReloadWeapon(event, button) {
    const item = button.closest('[data-item-id]');
    const weapon = this.actor.items.get(item.dataset.itemId);
    reloadAmmo(this.actor, weapon);
  }

  static #onitemName(event, button) {
    const section = button.closest('.item');
    const detail = section.querySelector('.item-detail');
    if (!detail) return;
    detail.style.maxHeight = detail.style.maxHeight ? null : (detail.scrollHeight + 'px');
  }

  static async #onDeleteRaceButton(event, button) {
    const raceItem = this.actor.items.find(item => item.type === 'race');
    if (!raceItem) {
      ui.notifications.error(game.i18n.localize('torgeternity.notifications.noRaceToDelete'));
      return;
    }
    await DialogV2.confirm({
      window: { title: game.i18n.localize('torgeternity.dialogWindow.raceDeletion.title') },
      content: game.i18n.localize('torgeternity.dialogWindow.raceDeletion.content'),
      yes: async () => {
        await this.actor.deleteEmbeddedDocuments('Item', [
          raceItem.id,
          ...this.actor.items
            .filter(item => item.type === 'perk' && item.system.category === 'racial')
            .map(item => item.id),
        ]);
      },
      no: () => {
        return;
      },
    });
  }


}

/**
 *
 * @param skillValue
 * @param skillName
 * @param actor
 */
export function checkUnskilled(skillValue, skillName, actor) {
  if (skillValue) return false;

  foundry.applications.handlebars.renderTemplate(
    './systems/torgeternity/templates/chat/skill-error-card.hbs',
    {
      message: game.i18n.localize('torgeternity.skills.' + skillName) + ' ' + game.i18n.localize('torgeternity.chatText.check.cantUseUntrained'),
      actorPic: actor.img,
      actorName: actor.name,
    }).then(content =>
      ChatMessage.create({
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        owner: actor,
        content: content
      })
    )

  return true;
}
