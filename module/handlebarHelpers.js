/**
 * Register Handlebar helpers
 */
export function registerHelpers() {
  Handlebars.registerHelper('poolList', function (actorId) {
    const poolList = [];
    const actor = game.actors.get(actorId);
    const hand = actor.getDefaultHand();
    if (!hand) return game.i18n.localize('torgeternity.notifications.noHands');

    for (const card of hand.cards) {
      if (card.flags?.torgeternity?.pooled === true) {
        poolList.push(
          "<span class='pool-tooltip'>" +
            card.name +
            "<span class='pool-tooltip-image'><img src='" +
            card.img +
            "'></span></span>"
        );
      }
    }
    return poolList.join(', ');
  });

  Handlebars.registerHelper('concat', function (...params) {
    return params.slice(0, -1).join('');
  });

  Handlebars.registerHelper('displaySkill', function (editstate, skill) {
    return editstate || skill.adds;
  });
}
