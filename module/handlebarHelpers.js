/**
 * Register Handlebar helpers
 */
export function registerHelpers() {
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
