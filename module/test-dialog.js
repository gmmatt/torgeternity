import { ChatMessageTorg } from './documents/chat/document.js';
import * as torgchecks from './torgchecks.js';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

// Default values for all the fields in the dialog template
const DEFAULT_TEST = {
  // difficulty-selector
  DNDescriptor: "standard",    // number or string
  // bonus-selector
  previousBonus: null,
  bonus: null,      // null or number
  // favored
  isFav: false,
  disfavored: false,
  // movement-penalty
  movementModifier: 0,
  // multi-action
  multiModifier: 0,
  // multi-target
  targetsModifier: 0,
  // attack-options
  calledShotModifier: 0,
  vitalAreaDamageModifier: false,
  burstModifier: 0,
  allOutModifier: false,
  aimed: false,
  blindFireModifier: false,
  trademark: false,
  additionalDamage: null,   // Number or null
  addBDs: 0,  // 0-5
  // modifiers
  concealment: 0,
  other1Description: "",
  other1Modifier: 0,
  other2Description: "",
  other2Modifier: 0,
  other3Description: "",
  other3Modifier: 0,
  // fixed-modifiers
  stymiedModifier: 0,
  darknessModifier: 0,
  woundModifier: 0,
  sizeModifier: 0,
  speedModifier: 0,
  maneuverModifier: 0,
  coverModifier: 0,
  // sheet flags
  attackOptions: false,
  isAttack: false,
  applySize: false,
  chatNote: '',
}

export class TestDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  testMessage;

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['torgeternity', 'application', 'test-dialog', 'themed', 'theme-dark'],
    window: {
      title: 'Skill Test',
      resizable: false,
      contentClasses: ['standard-form'],
    },
    form: {
      handler: TestDialog.#onRoll,
      submitOnChange: false,
      closeOnSubmit: true,
    }
  }

  static PARTS = {
    create: { template: 'systems/torgeternity/templates/test-dialog.hbs' },
    update: { template: 'systems/torgeternity/templates/test-update.hbs' },
    footer: { template: "templates/generic/form-footer.hbs" },
  }

  /**
   *
   * @param {TestData} test the test object
   * @param {object} options Foundry base options for the Application
   * @returns {Promise<ChatMessageTorg|undefined>} The ChatMessage of the Roll
   */
  static asPromise(test, options) {
    return new Promise(resolve => new TestDialog(test, { ...options, callback: resolve }));
  }

  static renderUpdate(testData) {
    testData.mode = 'update';
    (new TestDialog(testData)).render(true);
  }

  /**
   *
   * @param {TestData} test The test object
   * @param {Function} resolve ChatMessage of the Roll
   * @param {object} options Foundry base options for the Application
   */
  constructor(test, options = {}) {
    super(options);
    this.mode = test.mode ?? 'create';
    this.test = foundry.utils.mergeObject(DEFAULT_TEST, test, { inplace: false });
    this.render(true);
  }

  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.test = this.test;
    context.config = CONFIG.torgeternity;

    if (this.mode === 'update') {
      context.buttons = [{ type: 'submit', icon: 'fas fa-redo', label: 'torgeternity.sheetLabels.update' }]
      return context;
    }

    // Set Modifiers from Actor Wounds and Status Effects
    const myActor = fromUuidSync(this.test.actor)
    context.test.hasModifiers = false;

    // The wound penalties are never more than -3, regardless on how many wounds a token can suffer / have. CrB p. 117
    context.test.woundModifier = -Math.min(myActor.system.wounds.value ?? 0, 3);

    context.test.stymiedModifier = myActor.statusModifiers.stymied;
    context.test.darknessModifier = myActor.statusModifiers.darkness;
    context.test.sizeModifier = 0;
    context.test.vulnerableModifier = 0;

    // Set Modifiers for Vehicles
    if (this.test.testType === 'chase') {
      if (this.test.vehicleSpeed < 11) {
        context.test.speedModifier = 0;
      } else if (this.test.vehicleSpeed < 15) {
        context.test.speedModifier = 2;
      } else if (this.test.vehicleSpeed < 17) {
        context.test.speedModifier = 4;
      } else {
        context.test.speedModifier = 6;
      }
      // maneuverModifier already set in TorgeternityActorSheet
    } else if (this.test.testType === 'stunt' || this.test.testType === 'vehicleBase') {
      // Do Nothing - this leaves maneuverModifier in place
    } else {
      context.test.speedModifier = 0;
      context.test.maneuverModifier = 0;
    }

    //
    // ***Set Target Data***
    // Transfer data here because passing the entire target to a chat message tends to degrade the data
    //
    const targets = this.options.useTargets ? Array.from(game.user.targets) : [];
    context.test.targetPresent = !!targets.length;
    const MULTITARGET = [0, 0, -2, -4, -6, -8, -10];
    context.test.targetsModifier ||= MULTITARGET[targets.length] ?? 0;

    if (context.test.targetPresent && context.test.testType !== 'soak') {
      context.test.targetAll = targets.map(token => oneTestTarget(token, this.test.applySize));
      context.test.sizeModifier = context.test.targetAll[0].sizeModifier;
    } else {
      context.test.targetAll = [];
    }

    context.test.hasModifiers =
      (context.test?.woundModifier ||
        context.test?.stymiedModifier ||
        context.test?.darknessModifier ||
        context.test?.sizeModifier ||
        context.test?.vulnerableModifier ||
        context.test?.speedModifier ||
        context.test?.maneuverModifier)
        ? true : false;

    context.buttons = [{ type: 'submit', icon: 'fas fa-dice-d20', label: 'torgeternity.sheetLabels.roll' }]
    return context;
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    switch (this.mode) {
      case 'create': options.parts = ['create', 'footer']; break;
      case 'update': options.parts = ['update', 'footer']; break;
    }
  }

  /**
   *
   * @param html
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    this.element.querySelector('#bonus-text')?.addEventListener('change', this.onChangeBonusText.bind(this));
  }

  /**
   * Ensure the correct radio button is selected.
   * @param {*} event 
   * 
   */
  onChangeBonusText(event) {
    const input = event.target;
    input.parentElement.querySelector(input.value.length ? '#previous-bonus' : '#roll').checked = true;
  }

  /**
   *
   * @param event
   * @param html
   */
  static async #onRoll(event, form, formData) {
    const fields = formData.object;

    if (this.mode === 'update') {
      const fields = formData.object;

      foundry.utils.mergeObject(this.test, fields, { inplace: true });

      this.test.isOther1 = fields.other1Modifier != 0;
      this.test.isOther2 = fields.other2Modifier != 0;
      this.test.isOther3 = fields.other3Modifier != 0;

      this.test.diceroll = null;

    } else {

      // Set DN Descriptor unless actively defending (in which case no DN, but we set to standard to avoid problems down the line)
      this.test.DNDescriptor =
        this.test.testType === 'activeDefense'
          ? 'standard'
          : fields.DNDescriptor;

      // Check for disfavored and flag if needed
      this.test.disfavored = fields.disfavored;

      // Check for favored and flag if needed
      this.test.isFav = fields.isFav;

      // Add bonus, if needed
      this.test.previousBonus = fields.previousBonus;
      this.test.bonus = this.test.previousBonus ? fields.bonus : null;

      // Add movement modifier
      this.test.movementModifier = fields.movementModifier;

      // Add multi-action modifier
      this.test.multiModifier = fields.multiModifier;

      // Add multi-target modifier
      this.test.targetsModifier = fields.targetsModifier;

      //
      // Add attack and target options if needed
      //
      if (this.test.attackOptions) {
        // Add Called Shot Modifier
        this.test.calledShotModifier = fields.calledShotModifier;

        // Add Vital Hit Modifier
        this.test.vitalAreaDamageModifier = fields.vitalAreaDamageModifier ?? 0;

        // Add Burst Modifier
        this.test.burstModifier = fields.burstModifier;

        const myActor = fromUuidSync(this.test.actor);
        const myItem = this.test.itemId ? myActor.items.get(this.test.itemId) : null;
        if (
          myItem?.weaponWithAmmo &&
          this.test.burstModifier > 0 &&
          !myItem.hasSufficientAmmo(this.test.burstModifier, this.test?.targetAll.length)
        ) {
          ui.notifications.warn(game.i18n.localize('torgeternity.chatText.notSufficientAmmo'));
          return;
        }

        // Add All-Out Attack
        this.test.allOutModifier = fields.allOutModifier;

        // Add Amied Shot
        this.test.aimedModifier = fields.aimedModifier ?? 0;

        // Add Blind Fire
        this.test.blindFireModifier = fields.blindFireModifier ?? 0;

        // Add Trademark Weapon
        this.test.trademark = fields.trademark;

        // Add Concealment Modifier
        this.test.concealmentModifier = fields.concealmentModifier;

        // Add Cover Modifier
        this.test.coverModifier = fields.coverModifier ?? 0;

        // Add additional damage and BDs in promise. Null if not applicable
        this.test.additionalDamage = fields.additionalDamage ?? 0;

        this.test.addBDs = fields.addBDs ?? 0;
      }

      // Add other modifiers 1-3
      for (let i = 1; i <= 3; i++) {
        const modifier = fields[`other${i}Modifier`];
        const isActive = modifier != 0;

        this.test[`isOther${i}`] = isActive;

        if (isActive) {
          this.test[`other${i}Description`] = fields[`other${i}Description`];
          this.test[`other${i}Modifier`] = modifier;
        }
      }
    }

    const messages = await torgchecks.renderSkillChat(this.test);
    if (messages && this.options.callback) {
      for (const message of messages) {
        this.options.callback(message);
      }
    }
    this.close();
  }
}


export function oneTestTarget(token, applySize) {
  const actor = token.actor;

  let sizeModifier;
  if (applySize) {
    switch (actor.system.details.sizeBonus) {
      case 'normal': sizeModifier = 0; break;
      case 'tiny': sizeModifier = -6; break;
      case 'verySmall': sizeModifier = -4; break;
      case 'small': sizeModifier = -2; break;
      case 'large': sizeModifier = 2; break;
      case 'veryLarge': sizeModifier = 4; break;
      default: sizeModifier = 0; break;
    }
  }

  // Set vehicle defense if needed
  if (actor.type === 'vehicle') {
    return {
      present: true,
      type: actor.type,
      id: actor.id,
      uuid: token.document.uuid,
      targetPic: actor.img,
      targetName: actor.name,
      sizeModifier: sizeModifier,
      defenses: {
        vehicle: actor.system.defense,
        dodge: actor.system.defense,
        unarmedCombat: actor.system.defense,
        meleeWeapons: actor.system.defense,
        intimidation: actor.system.defense,
        maneuver: actor.system.defense,
        taunt: actor.system.defense,
        trick: actor.system.defense,
      },
      toughness: actor.defenses.toughness,
      armor: actor.defenses.armor,
    };
  } else {
    return {
      present: true,
      type: actor.type,
      id: actor.id,
      uuid: token.document.uuid,
      targetPic: actor.img,
      targetName: actor.name,
      skills: actor.system.skills,
      attributes: actor.system.attributes,
      toughness: actor.defenses.toughness,
      armor: actor.defenses.armor,
      vulnerableModifier: actor.statusModifiers.vulnerable,
      sizeModifier: sizeModifier,
      defenses: {
        dodge: actor.defenses.dodge.value,
        unarmedCombat: actor.defenses.unarmedCombat.value,
        meleeWeapons: actor.defenses.meleeWeapons.value,
        intimidation: actor.defenses.intimidation.value,
        maneuver: actor.defenses.maneuver.value,
        taunt: actor.defenses.taunt.value,
        trick: actor.defenses.trick.value,
      },
    };
  }
}
