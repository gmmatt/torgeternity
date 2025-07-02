import { ChatMessageTorg } from './documents/chat/document.js';
import * as torgchecks from './torgchecks.js';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 *
 */
export class TestDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  testMessage;

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['torgeternity', 'application', 'test-dialog'],
    window: {
      title: 'Skill Test',
      resizable: false,
      contentClasses: ["standard-form"],
    },
    form: {
      handler: TestDialog.#onRoll,
      submitOnChange: false,
      closeOnSubmit: true,
    }
  }

  static PARTS = {
    body: { template: 'systems/torgeternity/templates/test-dialog.hbs' },
    footer: { template: "templates/generic/form-footer.hbs" },
  }

  /**
   *
   * @param {object} test the test object
   * @param {object} options Foundry base options for the Application
   * @returns {Promise<ChatMessageTorg|undefined>} The ChatMessage of the Roll
   */
  static asPromise(test, options) {
    return new Promise((resolve) => new TestDialog(test, resolve, options));
  }

  /**
   *
   * @param {object} test The test object
   * @param {Function} resolve ChatMessage of the Roll
   * @param {object} options Foundry base options for the Application
   */
  constructor(test, resolve, options = {}) {
    super(options);
    this.test = test;
    this.callback = resolve;
    this.render(true);
  }

  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    context.test = this.test;
    context.config = CONFIG.torgeternity;

    // Set Modifiers from Actor Wounds and Status Effects
    const myActor = this.test.actor.includes('Token')
      ? fromUuidSync(this.test.actor)
      : fromUuidSync(this.test.actor);
    context.test.hasModifiers = false;

    if (parseInt(myActor.system.wounds.value) <= 3) {
      // The wound penalties are never more than -3, regardless on how many wounds a token can suffer / have. CrB p. 117
      context.test.woundModifier = parseInt(-myActor.system.wounds.value);
    } else if (
      myActor.system.wounds.value == null ||
      isNaN(parseInt(myActor.system.wounds.value))
    ) {
      // currentWounds could be empty or a char/string. Users... You know?!
      context.test.woundModifier = 0;
    } else {
      context.test.woundModifier = -3;
    }

    context.test.stymiedModifier = myActor.statusModifiers.stymied;
    context.test.darknessModifier = myActor.statusModifiers.darkness;
    context.test.sizeModifier = 0;
    context.test.vulnerableModifier = 0;
    context.test.sizeModifierAll = [];
    context.test.vulnerableModifierAll = [];
    context.test.targetAll = [];
    context.test.targetsAllID = [];

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
    const allID = [];
    const allUUID = [];
    context.test.targetPresent = context.test.targets.length > 0 ? true : false;
    if ((context.test.targets.length > 0) & (context.test.testType !== 'soak')) {
      // Identify the first target
      // var target = Array.from(data.test.targets)[0].actor;
      context.test.targets.forEach((t) => {
        allID.push(t.actor.id);
        allUUID.push(t.document.uuid);
      });
      context.test.targetsAllID = allID;
      context.test.targetsAllUUID = allUUID;
      context.test.targets.forEach((t) => {
        const target = t.actor;
        // Set vehicle defense if needed
        if (target.type === 'vehicle') {
          context.test.targetAll.push({
            present: true,
            type: 'vehicle',
            id: target.id,
            uuid: t.document.uuid,
            targetPic: target.img,
            targetName: target.name,
            defenses: {
              vehicle: target.system.defense,
              dodge: target.system.defense,
              unarmedCombat: target.system.defense,
              meleeWeapons: target.system.defense,
              intimidation: target.system.defense,
              maneuver: target.system.defense,
              taunt: target.system.defense,
              trick: target.system.defense,
            },
            toughness: target.defenses.toughness,
            armor: target.defenses.armor,
          });
        } else {
          context.test.targetAll.push({
            present: true,
            type: target.type,
            id: target.id,
            uuid: t.document.uuid,
            targetPic: target.img,
            targetName: target.name,
            skills: target.system.skills,
            attributes: target.system.attributes,
            toughness: target.defenses.toughness,
            armor: target.defenses.armor,
            defenses: {
              dodge: target.defenses.dodge.value,
              unarmedCombat: target.defenses.unarmedCombat.value,
              meleeWeapons: target.defenses.meleeWeapons.value,
              intimidation: target.defenses.intimidation.value,
              maneuver: target.defenses.maneuver.value,
              taunt: target.defenses.taunt.value,
              trick: target.defenses.trick.value,
            },
          });
          context.test.vulnerableModifierAll.push(target.statusModifiers.vulnerable);
        }
        if (this.test.applySize == true) {
          const sizeBonus = target.system.details.sizeBonus;
          switch (sizeBonus) {
            case 'normal':
              context.test.sizeModifier = 0;
              break;
            case 'tiny':
              context.test.sizeModifier = -6;
              break;
            case 'verySmall':
              context.test.sizeModifier = -4;
              break;
            case 'small':
              context.test.sizeModifier = -2;
              break;
            case 'large':
              context.test.sizeModifier = 2;
              break;
            case 'veryLarge':
              context.test.sizeModifier = 4;
              break;
            default:
              context.test.sizeModifier = 0;
          }
          context.test.sizeModifierAll.push(context.test.sizeModifier);
        }
      });
    }

    context.test.hasModifiers =
      context.test?.woundModifier != 0 ||
        context.test?.stymiedModifier != 0 ||
        context.test?.darknessModifier != 0 ||
        context.test?.sizeModifier != 0 ||
        context.test?.vulnerableModifier != 0 ||
        context.test?.speedModifier != 0 ||
        context.test?.maneuverModifier != 0
        ? true
        : false;

    context.buttons = [
      { type: 'submit', icon: 'fas fa-dice-d20', label: 'torgeternity.sheetLabels.roll' }
    ]
    return context;
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
    const rdb = input.parentElement.querySelector('#roll');
    const rdbNum = input.parentElement.querySelector('#previous-bonus');
    if (!rdb) return;
    const isEmpty = isNaN(parseInt(input.value));
    rdb.checked = isEmpty;
    rdbNum.checked = !isEmpty;
  }
  /**
   *
   * @param event
   * @param html
   */
  static async #onRoll(event, form, formData) {
    const fields = formData.object;

    // foundry.utils.mergeObject(this.test, fields, { inplace: true });

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

      if (
        this.test.item?.weaponWithAmmo &&
        this.test.burstModifier > 0 &&
        !this.test.item.hasSufficientAmmo(this.test.burstModifier, this.test?.targetAll.length)
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

    const messages = await torgchecks.renderSkillChat(this.test);
    if (messages && this.callback) {
      for (const message of messages) {
        this.callback(message);
      }
    }
    this.close();
  }
}
