import { ChatMessageTorg } from './documents/chat/document.js';
import * as torgchecks from './torgchecks.js';

/**
 *
 */
export class TestDialog extends FormApplication {
  testMessage;

  /**
   *
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = 'systems/torgeternity/templates/test-dialog.hbs';
    options.width = 'auto';
    options.height = 'auto';
    options.title = 'Skill Test';
    options.resizeable = false;
    return options;
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
  getData() {
    const data = super.getData();

    data.test = this.test;

    data.config = CONFIG.torgeternity;

    // Set Modifiers from Actor Wounds and Status Effects
    const myActor = this.test.actor.includes('Token')
      ? fromUuidSync(this.test.actor)
      : fromUuidSync(this.test.actor);
    data.test.hasModifiers = false;

    if (parseInt(myActor.system.wounds.value) <= 3) {
      // The wound penalties are never more than -3, regardless on how many wounds a token can suffer / have. CrB p. 117
      data.test.woundModifier = parseInt(-myActor.system.wounds.value);
    } else if (
      myActor.system.wounds.value == null ||
      isNaN(parseInt(myActor.system.wounds.value))
    ) {
      // currentWounds could be empty or a char/string. Users... You know?!
      data.test.woundModifier = 0;
    } else {
      data.test.woundModifier = -3;
    }

    data.test.stymiedModifier = myActor.statusModifiers.stymied;
    data.test.darknessModifier = myActor.statusModifiers.darkness;
    data.test.sizeModifier = 0;
    data.test.vulnerableModifier = 0;
    data.test.sizeModifierAll = [];
    data.test.vulnerableModifierAll = [];
    data.test.targetAll = [];
    data.test.targetsAllID = [];

    // Set Modifiers for Vehicles
    if (this.test.testType === 'chase') {
      if (this.test.vehicleSpeed < 11) {
        data.test.speedModifier = 0;
      } else if (this.test.vehicleSpeed < 15) {
        data.test.speedModifier = 2;
      } else if (this.test.vehicleSpeed < 17) {
        data.test.speedModifier = 4;
      } else {
        data.test.speedModifier = 6;
      }
      // maneuverModifier already set in TorgeternityActorSheet
    } else if (this.test.testType === 'stunt' || this.test.testType === 'vehicleBase') {
      // Do Nothing - this leaves maneuverModifier in place
    } else {
      data.test.speedModifier = 0;
      data.test.maneuverModifier = 0;
    }

    //
    // ***Set Target Data***
    // Transfer data here because passing the entire target to a chat message tends to degrade the data
    //
    const allID = [];
    const allUUID = [];
    data.test.targetPresent = data.test.targets.length > 0 ? true : false;
    if ((data.test.targets.length > 0) & (data.test.testType !== 'soak')) {
      // Identify the first target
      // var target = Array.from(data.test.targets)[0].actor;
      data.test.targets.forEach((t) => {
        allID.push(t.actor.id);
        allUUID.push(t.document.uuid);
      });
      data.test.targetsAllID = allID;
      data.test.targetsAllUUID = allUUID;
      data.test.targets.forEach((t) => {
        const target = t.actor;
        // Set vehicle defense if needed
        if (target.type === 'vehicle') {
          data.test.targetAll.push({
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
          data.test.targetAll.push({
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
          data.test.vulnerableModifierAll.push(target.statusModifiers.vulnerable);
        }
        if (this.test.applySize == true) {
          const sizeBonus = target.system.details.sizeBonus;
          switch (sizeBonus) {
            case 'normal':
              data.test.sizeModifier = 0;
              break;
            case 'tiny':
              data.test.sizeModifier = -6;
              break;
            case 'verySmall':
              data.test.sizeModifier = -4;
              break;
            case 'small':
              data.test.sizeModifier = -2;
              break;
            case 'large':
              data.test.sizeModifier = 2;
              break;
            case 'veryLarge':
              data.test.sizeModifier = 4;
              break;
            default:
              data.test.sizeModifier = 0;
          }
          data.test.sizeModifierAll.push(data.test.sizeModifier);
        }
      });
    }

    data.test.hasModifiers =
      data.test?.woundModifier != 0 ||
      data.test?.stymiedModifier != 0 ||
      data.test?.darknessModifier != 0 ||
      data.test?.sizeModifier != 0 ||
      data.test?.vulnerableModifier != 0 ||
      data.test?.speedModifier != 0 ||
      data.test?.maneuverModifier != 0
        ? true
        : false;

    return data;
  }

  /**
   *
   * @param html
   */
  activateListeners(html) {
    html.find('.test-dialog-rollbutton').click(this._onRoll.bind(this));

    const bonusText = html[0].querySelector('#bonus-text');

    bonusText.addEventListener('change', (event) => {
      if (isNaN(parseInt(event.currentTarget.value))) {
        const rdb = $(event.currentTarget).parent().find('#roll');
        const rdbNo = $(event.currentTarget).parent().find('#previous-bonus');
        if (rdb.length > 0) {
          rdb.prop('checked', true);
          rdbNo.prop('checked', false);
        }
      } else {
        const rdb = $(event.currentTarget).parent().find('#previous-bonus');
        const rdbNo = $(event.currentTarget).parent().find('#roll');
        if (rdb.length > 0) {
          rdb.prop('checked', true);
          rdbNo.prop('checked', false);
        }
      }
    });

    super.activateListeners(html);
  }

  /**
   *
   * @param event
   * @param html
   */
  async _onRoll(event, html) {
    // Set DN Descriptor unless actively defending (in which case no DN, but we set to standard to avoid problems down the line)
    this.test.DNDescriptor =
      this.test.testType === 'activeDefense'
        ? 'standard'
        : document.getElementById('difficulty').value;

    // Check for disfavored and flag if needed
    this.test.disfavored = document.getElementById('disfavored').checked;

    // Check for favored and flag if needed
    this.test.isFav = document.getElementById('favored').checked;

    // Add bonus, if needed
    this.test.previousBonus = document.getElementById('previous-bonus').checked;
    this.test.bonus = document.getElementById('previous-bonus').checked
      ? document.getElementById('bonus-text').value
      : null;

    // Add movement modifier
    this.test.movementModifier = document.getElementById('running-radio').checked ? -2 : 0;

    // Add multi-action modifier
    this.test.multiModifier =
      [
        ['multi1-radio', 0],
        ['multi2-radio', -2],
        ['multi3-radio', -4],
      ].find(([id]) => document.getElementById(id).checked)?.[1] ?? -6;

    // Add multi-target modifier
    this.test.targetsModifier =
      [
        ['targets1-radio', 0],
        ['targets2-radio', -2],
        ['targets3-radio', -4],
        ['targets4-radio', -6],
        ['targets5-radio', -8],
      ].find(([id]) => document.getElementById(id).checked)?.[1] ?? -10;

    //
    // Add attack and target options if needed
    //
    if (this.test.attackOptions) {
      // Add Called Shot Modifier
      this.test.calledShotModifier = [
        ['called-shot-none', 0],
        ['called-shot-2', -2],
        ['called-shot-4', -4],
        ['called-shot-6', -6],
      ].find(([id]) => document.getElementById(id).checked)?.[1];

      // Add Vital Hit Modifier
      this.test.vitalAreaDamageModifier = document.getElementById('vital-area').checked ? 4 : 0;

      // Add Burst Modifier
      this.test.burstModifier = [
        ['burst-none', 0],
        ['burst-short', 2],
        ['burst-long', 4],
        ['burst-heavy', 6],
      ].find(([id]) => document.getElementById(id).checked)?.[1];

      if (
        this.test.item?.weaponWithAmmo &&
        this.test.burstModifier > 0 &&
        !this.test.item.hasSufficientAmmo(this.test.burstModifier, this.test?.targetAll.length)
      ) {
        ui.notifications.warn(game.i18n.localize('torgeternity.chatText.notSufficientAmmo'));
        return;
      }

      // Add All-Out Attack
      this.test.allOutModifier = document.getElementById('all-out').checked ? 4 : 0;

      // Add Amied Shot
      this.test.aimedModifier = document.getElementById('aimed').checked ? 4 : 0;

      // Add Blind Fire
      this.test.blindFireModifier = document.getElementById('blind-fire').checked ? -6 : 0;

      // Add Trademark Weapon
      this.test.trademark = document.getElementById('trademark-weapon').checked;

      // Add Concealment Modifier
      this.test.concealmentModifier = [
        ['concealment-none', 0],
        ['concealment-2', -2],
        ['concealment-4', -4],
        ['concealment-6', -6],
      ].find(([id]) => document.getElementById(id))?.[1];

      // Add Cover Modifier
      this.test.coverModifier =
        document.getElementById('cover').value != 0 ? document.getElementById('cover').value : 0;

      // Add additional damage and BDs in promise. Null if not applicable
      this.test.additionalDamage =
        !isNaN(parseInt(document.getElementById('additional-damage')?.value)) &&
        parseInt(document.getElementById('additional-damage').value);

      this.test.addBDs =
        parseInt(document.getElementById('additionalBDSelect').value) > 0 &&
        parseInt(document.getElementById('additionalBDSelect').value);
    }

    // Add other modifiers 1-3
    for (let i = 1; i <= 3; i++) {
      const modifier = document.getElementById(`other${i}-modifier-text`).value;
      const isActive = modifier != 0;

      this.test[`isOther${i}`] = isActive;

      if (isActive) {
        this.test[`other${i}Description`] = document.getElementById(
          `other${i}-description-text`
        ).value;
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
