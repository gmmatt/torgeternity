import { ChatMessageTorg } from './documents/chat/document.js';
import * as torgchecks from './torgchecks.js';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

// Default values for all the fields in the dialog template
const DEFAULT_TEST = {
  // difficulty-selector
  DNDescriptor: "standard",    // number or string
  // bonus-selector
  previousBonus: false,
  bonus: null,      // null or number
  rollTotal: 0,   // 0 = force a manual dice roll
  // favored
  isFav: false,
  disfavored: false,
  skillName: '',
  customSkill: false,
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
  allOutFlag: false,
  aimedFlag: false,
  blindFireFlag: false,
  trademark: false,
  additionalDamage: null,   // Number or null
  addBDs: 0,  // 0-5
  // modifiers
  concealmentModifier: 0,
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

  get title() {
    let label = TestDialogLabel(this.test);
    // if (this.itemId) label = fromUuidSync(this.actor)?.items.get(this.itemId)?.name;
    return label ?? 'Skill Test';
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
    new TestDialog(testData);
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

    // Ensure all relevant fields are Number
    for (const key of Object.keys(DEFAULT_TEST))
      if (typeof DEFAULT_TEST[key] === 'number' && typeof this.test[key] !== 'number')
        this.test[key] = Number(this.test[key]);

    // Immediately display the dialog
    this.render(true);
  }

  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // various choice lists
    context.choices = CONFIG.torgeternity.choices;
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
      context.test.vulnerableModifier = context.test.targetAll[0].vulnerableModifier;
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
    foundry.utils.mergeObject(this.test, fields, { inplace: true });

    this.test.isOther1 = fields.other1Modifier != 0;
    this.test.isOther2 = fields.other2Modifier != 0;
    this.test.isOther3 = fields.other3Modifier != 0;

    if (this.mode === 'update') {

      this.test.diceroll = null;

    } else {

      // Set DN Descriptor unless actively defending (in which case no DN, but we set to standard to avoid problems down the line)
      if (this.test.testType === 'activeDefense') this.test.DNDescriptor = 'standard';

      // Add bonus, if needed
      this.test.previousBonus = fields.previousBonus;
      this.test.bonus = this.test.previousBonus ? fields.bonus : null;

      //
      // Add attack and target options if needed
      //
      if (this.test.attackOptions) {

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

        // Add Cover Modifier
        this.test.addBDs ??= 0;
        this.test.additionalDamage ??= 0;
        this.test.coverModifier ??= 0;
        this.test.vitalAreaDamageModifier ??= 0;
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
      type: actor.type,
      id: actor.id,
      uuid: token.document.uuid,
      targetPic: actor.img,
      targetName: actor.name,
      sizeModifier: sizeModifier,
      toughness: actor.defenses.toughness,
      armor: actor.defenses.armor,
      // then vehicle specifics
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
    };
  } else {
    return {
      type: actor.type,
      id: actor.id,
      uuid: token.document.uuid,
      targetPic: actor.img,
      targetName: actor.name,
      sizeModifier: sizeModifier,
      toughness: actor.defenses.toughness,
      armor: actor.defenses.armor,
      // then non-vehicle changes
      skills: actor.system.skills,
      attributes: actor.system.attributes,
      vulnerableModifier: actor.statusModifiers.vulnerable,
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


export function TestDialogLabel(test) {
  let result;

  switch (test.testType) {
    case 'attribute':
      result = `${game.i18n.localize('torgeternity.attributes.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.test')} `;
      break;
    case 'skill':
      result = test.customSkill ? `${test.skillName} ` :
        `${game.i18n.localize('torgeternity.skills.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.test')} `;
      break;
    case 'interactionAttack':
    case 'attack':
      result = `${game.i18n.localize('torgeternity.skills.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.attack')}`;
      break;
    case 'soak':
      result = `${game.i18n.localize('torgeternity.sheetLabels.soakRoll')} `;
      break;
    case 'activeDefense':
      result = `${game.i18n.localize('torgeternity.sheetLabels.activeDefense')} `;
      break;
    case 'power':
      result = `${test.powerName} ${game.i18n.localize('torgeternity.chatText.test')} `;
      break;
    case 'chase':
      result = `${game.i18n.localize('torgeternity.chatText.chase')} `;
      break;
    case 'stunt':
      result = `${game.i18n.localize('torgeternity.chatText.stunt')} `;
      break;
    case 'vehicleBase':
      result = `${game.i18n.localize('torgeternity.chatText.vehicleBase')}  `;
      break;
    case 'custom':
      result = test.skillName;
      break;
    default:
      console.log(`--TestDialogLabel: Unknown Test type: ${test.testType}`);
      result = `${test.skillName} ${game.i18n.localize('torgeternity.chatText.test')}  `;
  }
  if (test.itemId) {
    const itemLabel = fromUuidSync(test.actor, { strict: false })?.items.get(test.itemId).name;
    if (itemLabel) result += ` (${itemLabel})`;
  }
  return result;
}