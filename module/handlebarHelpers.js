import { torgeternity } from './config.js';

/**
 * Register Handlebar helpers
 */
export function registerHelpers() {
  Handlebars.registerHelper('concatAttributeName', function (attributeName) {
    const localName = 'torgeternity.attributes.' + attributeName;
    return localName;
  });
  Handlebars.registerHelper('concatPerkType', function (type) {
    const localName = 'torgeternity.perkTypes.' + type;
    return localName;
  });

  Handlebars.registerHelper('concatSkillName', function (skillName) {
    const localName = 'torgeternity.skills.' + skillName;
    return localName;
  });

  Handlebars.registerHelper('concatClearanceLevel', function (clearance) {
    const localClearance = 'torgeternity.clearances.' + clearance;
    return localClearance;
  });

  Handlebars.registerHelper('concatCardType', function (cardType) {
    const localCardType = 'torgeternity.cardTypes.' + cardType;
    return localCardType;
  });

  // Is this actor actively defending right now?
  Handlebars.registerHelper('detectActiveDefense', function (data) {
    let i;
    const effects = data.effects;
    for (i = 0; i < effects.length; i++) {
      if (effects[i].name === 'ActiveDefense') {
        return true;
      }
    }
    return false;
  });

  // Is this test an active defense roll?
  Handlebars.registerHelper('activeDefenseRoll', function (data) {
    if (data.testType === 'activeDefense') {
      return true;
    }
    return false;
  });

  // Is at least one target available in this test?
  Handlebars.registerHelper('targetAvailable', function (data) {
    if (Array.from(data.targets).length > 0) {
      return true;
    } else {
      return false;
    }
  });

  Handlebars.registerHelper('ifequal', function (a, b, options) {
    if (a == b) {
      // eslint-disable-next-line no-invalid-this
      return options.fn(this);
    }
    // eslint-disable-next-line no-invalid-this
    return options.inverse(this);
  });

  Handlebars.registerHelper('iffalse', function (a, options) {
    if ((a == 'false') | (a == false)) {
      // eslint-disable-next-line no-invalid-this
      return options.fn(this);
    } else {
      // eslint-disable-next-line no-invalid-this
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper('poolList', function (actorId) {
    let poolList = '';
    const actor = game.actors.get(actorId);
    if (actor.getDefaultHand()) {
      const stack = actor.getDefaultHand();
      const hand = stack.cards;
      let i = 0;
      let firstItemExists = false;
      for (i = 0; i < hand.size; i++) {
        if (hand.contents[i].flags?.torgeternity?.pooled === true) {
          if (firstItemExists === true) {
            poolList +=
              ', ' +
              '<span class="pool-tooltip">' +
              hand.contents[i].name +
              "<span class='pool-tooltip-spanimage'><img src='" +
              hand.contents[i].img +
              "'></span></span>";
          } else {
            poolList =
              "<span class='pool-tooltip'>" +
              hand.contents[i].name +
              "<span class='pool-tooltip-image'><img src='" +
              hand.contents[i].img +
              "'></span></span>";
            // poolList = hand.document.availableCards[i].data.name;
            firstItemExists = true;
          }
        }
      }
      return poolList;
    } else {
      return game.i18n.localize('torgeternity.notifications.noHands');
    }
  });

  Handlebars.registerHelper('hideElement', function (displayTo, current) {
    if (parseInt(current) > parseInt(displayTo)) {
      return 'hidden';
    } else {
      return '';
    }
  });

  Handlebars.registerHelper('displaySkill', function (editstate, skill) {
    return editstate || skill.adds;
  });

  Handlebars.registerHelper('skillIsCombat', function (skill) {
    return skill.groupName === 'combat';
  });

  Handlebars.registerHelper('skillIsInteraction', function (skill) {
    return skill.groupName === 'interaction';
  });

  Handlebars.registerHelper('skillIsOther', function (skill) {
    return skill.groupName === 'other';
  });

  Handlebars.registerHelper('hasfinish', function (that) {
    let finished;
    try {
      finished = that.combat.combatants.find((c) => c.actorId === game.user.character.id).flags
        .world.turnTaken;
    } catch (e) {
      finished = true;
    }
    return finished;
  });

  Handlebars.registerHelper('getOptionBoolean', function (optionName) {
    return game.settings.get('torgeternity', optionName);
  });
}
