import { ChatMessageTorg } from './chat/document.js';
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

    data.test.stymiedModifier = parseInt(myActor.system.stymiedModifier);
    data.test.darknessModifier = parseInt(myActor.system.darknessModifier);
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
            toughness: target.system.toughness,
            armor: target.system.armor,
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
            toughness: target.system.other.toughness,
            armor: target.system.other.armor,
            defenses: {
              dodge: target.system.dodgeDefense,
              unarmedCombat: target.system.unarmedCombatDefense,
              meleeWeapons: target.system.meleeWeaponsDefense,
              intimidation: target.system.intimidationDefense,
              maneuver: target.system.maneuverDefense,
              taunt: target.system.tauntDefense,
              trick: target.system.trickDefense,
            },
          });
          data.test.vulnerableModifierAll.push(target.system.vulnerableModifier);
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
    } else {
      data.test.target = {
        present: false,
      };
    }

    if (
      data.test?.woundModifier != 0 ||
      data.test?.stymiedModifier != 0 ||
      data.test?.darknessModifier != 0 ||
      data.test?.sizeModifier != 0 ||
      data.test?.vulnerableModifier != 0 ||
      data.test?.speedModifier != 0 ||
      data.test?.maneuverModifier != 0
    ) {
      data.test.hasModifiers = true;
    }

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
    if (this.test.testType != 'activeDefense') {
      this.test.DNDescriptor = document.getElementById('difficulty').value;
    } else {
      this.test.DNDescriptor = 'standard';
    }

    // Check for disfavored and flag if needed
    if (document.getElementById('disfavored').checked) {
      this.test.disfavored = true;
    } else {
      this.test.disfavored = false;
    }

    // Check for favored and flag if needed
    if (document.getElementById('favored').checked) {
      this.test.isFav = true;
    }

    // Add bonus, if needed
    if (document.getElementById('previous-bonus').checked) {
      this.test.previousBonus = true;
      this.test.bonus = document.getElementById('bonus-text').value;
    } else {
      this.test.previousBonus = false;
      this.test.bonus = null;
    }

    // Add movement modifier
    if (document.getElementById('running-radio').checked) {
      this.test.movementModifier = -2;
    } else {
      this.test.movementModifier = 0;
    }

    // Add multi-action modifier
    if (document.getElementById('multi1-radio').checked) {
      this.test.multiModifier = 0;
    } else if (document.getElementById('multi2-radio').checked) {
      this.test.multiModifier = -2;
    } else if (document.getElementById('multi3-radio').checked) {
      this.test.multiModifier = -4;
    } else {
      this.test.multiModifier = -6;
    }

    // Add multi-target modifier
    if (document.getElementById('targets1-radio').checked) {
      this.test.targetsModifier = 0;
    } else if (document.getElementById('targets2-radio').checked) {
      this.test.targetsModifier = -2;
    } else if (document.getElementById('targets3-radio').checked) {
      this.test.targetsModifier = -4;
    } else if (document.getElementById('targets4-radio').checked) {
      this.test.targetsModifier = -6;
    } else if (document.getElementById('targets5-radio').checked) {
      this.test.targetsModifier = -8;
    } else {
      this.test.targetsModifier = -10;
    }

    //
    // Add attack and target options if needed
    //
    if (this.test.attackOptions === true) {
      // Add Called Shot Modifier
      if (document.getElementById('called-shot-none').checked) {
        this.test.calledShotModifier = 0;
      } else if (document.getElementById('called-shot-2').checked) {
        this.test.calledShotModifier = -2;
      } else if (document.getElementById('called-shot-4').checked) {
        this.test.calledShotModifier = -4;
      } else if (document.getElementById('called-shot-6').checked) {
        this.test.calledShotModifier = -6;
      }

      // Add Vital Hit Modifier
      if (document.getElementById('vital-area').checked) {
        this.test.vitalAreaDamageModifier = 4;
      } else {
        this.test.vitalAreaDamageModifier = 0;
      }

      // Add Burst Modifier
      if (document.getElementById('burst-none').checked) {
        this.test.burstModifier = 0;
      } else if (document.getElementById('burst-short').checked) {
        this.test.burstModifier = 2;
      } else if (document.getElementById('burst-long').checked) {
        this.test.burstModifier = 4;
      } else if (document.getElementById('burst-heavy').checked) {
        this.test.burstModifier = 6;
      }

      // Add All-Out Attack
      if (document.getElementById('all-out').checked) {
        this.test.allOutModifier = 4;
      } else {
        this.test.allOutModifier = 0;
      }

      // Add Amied Shot
      if (document.getElementById('aimed').checked) {
        this.test.aimedModifier = 4;
      } else {
        this.test.aimedModifier = 0;
      }

      // Add Blind Fire
      if (document.getElementById('blind-fire').checked) {
        this.test.blindFireModifier = -6;
      } else {
        this.test.blindFireModifier = 0;
      }

      // Add Trademark Weapon
      if (document.getElementById('trademark-weapon').checked) {
        this.test.trademark = true;
      } else {
        this.test.trademark = false;
      }

      // Add Concealment Modifier
      if (document.getElementById('concealment-none').checked) {
        this.test.concealmentModifier = 0;
      } else if (document.getElementById('concealment-2').checked) {
        this.test.concealmentModifier = -2;
      } else if (document.getElementById('concealment-4').checked) {
        this.test.concealmentModifier = -4;
      } else if (document.getElementById('concealment-6').checked) {
        this.test.concealmentModifier = -6;
      }

      // Add Cover Modifier
      if (document.getElementById('cover') != 0) {
        this.test.coverModifier = document.getElementById('cover').value;
      } else {
        this.test.coverModifier = 0;
      }
    }

    // Add other modifier 1
    if (document.getElementById('other1-modifier-text').value != 0) {
      this.test.isOther1 = true;
      this.test.other1Description = document.getElementById('other1-description-text').value;
      this.test.other1Modifier = document.getElementById('other1-modifier-text').value;
    } else {
      this.test.isOther1 = false;
    }

    // Add other modifier 2
    if (document.getElementById('other2-modifier-text').value != 0) {
      this.test.isOther2 = true;
      this.test.other2Description = document.getElementById('other2-description-text').value;
      this.test.other2Modifier = document.getElementById('other2-modifier-text').value;
    } else {
      this.test.isOther2 = false;
    }

    // Add other modifier 3
    if (document.getElementById('other3-modifier-text').value != 0) {
      this.test.isOther3 = true;
      this.test.other3Description = document.getElementById('other3-description-text').value;
      this.test.other3Modifier = document.getElementById('other3-modifier-text').value;
    } else {
      this.test.isOther3 = false;
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
