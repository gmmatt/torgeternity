/**
 * Register Handlebar helpers
 */
export function registerHelpers() {
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
}
