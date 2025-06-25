import PartySheet from './partySheet.js';
/**
 *
 */
export default class TorgeternityPlayerList extends foundry.applications.ui.Players {

  static DEFAULT_OPTIONS = {
    actions: {
      partySheet: TorgeternityPlayerList.#onPartySheet,
      possAdd: TorgeternityPlayerList.#onAaddPossibility,
      possMinus: TorgeternityPlayerList.#onMinusPossibility,
      possReset: TorgeternityPlayerList.#onResetPossibilities
    }
  }
  static PARTS = {
    players: {
      root: true,
      // override core "templates/ui/players.hbs"
      template: 'systems/torgeternity/templates/playerList/playerList.hbs'
    }
  }
  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.self = game.user;
    const gmuser = game.users.find((user) => user.isGM);
    context.GMpossibilities = gmuser.getFlag('torgeternity', 'GMpossibilities');
    context.users = [...context.active, ...context.inactive];
    for (const user of context.users) {
      const userdoc = game.users.get(user.id);
      user.character = userdoc.character;
      user.isGM = userdoc.isGM;
      user.characterPossibilities = parseInt(user.character?.system.other.possibilities ?? 0);
    }
    return context;
  }
  /**
   *
   */
  static async #onPartySheet() {
    foundry.applications.api.DialogV2.wait({
      classes: ['torgeternity'],
      window: { title: 'torgeternity.partySheet.openParty' },
      content: `${game.i18n.localize('torgeternity.partySheet.chooseParty')}`,
      buttons: [
        {
          action: "all",
          label: "torgeternity.partySheet.allPlayers",
          callback: () => PartySheet.showAllParty()
        },
        {
          action: 'active',
          label: "torgeternity.partySheet.activePlayers",
          callback: () => PartySheet.showActiveParty()
        }
      ]
    });
  }
  /**
   *
   * @param event
   */
  static async #onAaddPossibility(event, target) {
    if (target.dataset.targetId === 'GMpossibilities') {
      const gmuser = game.users.activeGM;
      const newVal = gmuser.getFlag('torgeternity', 'GMpossibilities') + 1;
      gmuser.setFlag('torgeternity', 'GMpossibilities', newVal);
    } else {
      const targetActor = game.actors.get(target.dataset.targetId);
      return targetActor.update({ "system.other.possibilities": parseInt(targetActor.system.other.possibilities) + 1, });
    }
  }
  /**
   *
   * @param event
   */
  static async #onMinusPossibility(event, target) {
    if (target.dataset.targetId === 'GMpossibilities') {
      const gmuser = game.users.activeGM;
      const newVal = gmuser.getFlag('torgeternity', 'GMpossibilities') - 1;
      gmuser.setFlag('torgeternity', 'GMpossibilities', newVal);
    } else {
      const targetActor = game.actors.get(target.dataset.targetId);
      return targetActor.update({ "system.other.possibilities": parseInt(targetActor.system.other.possibilities) - 1, });
    }
  }

  /**
   *
   * @param event
   */
  static #onResetPossibilities() {
    foundry.applications.api.DialogV2.wait({
      window: {
        title: 'torgeternity.possibilitiesReset.name',
      },
      content: `<div><span>${game.i18n.localize('torgeternity.possibilitiesReset.hint')}
            <input id="possibilitiesValue" value="3" type="number"/>
            </span></div>`,
      buttons: [
        {
          action: 'submit',
          icon: 'fas fa-check',
          label: 'torgeternity.submit.apply',
          callback: (event, target, dialog) => {
            const newVal = parseInt(dialog.element.querySelector('[id=possibilitiesValue]').value);
            game.users.forEach((user) => {
              if (user.character) {
                user.character.update({ "system.other.possibilities": newVal });
              }
            });
          },
        },
        {
          action: 'cancel',
          icon: 'fas fa-ban',
          label: 'torgeternity.submit.cancel',
        },
      ],
    });
  }
}
