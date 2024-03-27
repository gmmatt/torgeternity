import PartySheet from './partySheet.js';
import PartySheetActive from './partySheetActive.js';
/**
 *
 */
export default class TorgeternityPlayerList extends PlayerList {
  /**
   *
   */
  get template() {
    return 'systems/torgeternity/templates/playerList/playerList.hbs';
  }
  /**
   *
   */
  async getData() {
    const data = super.getData();
    data.self = game.user;
    const GM = game.users.find((user) => user.isGM);
    data.GMpossibilities = GM.getFlag('torgeternity', 'GMpossibilities');
    for (const user of data.users) {
      if (user.character) {
        const userActor = await game.actors.get(user.character);
        user.characterPossibilities = parseInt(userActor.system.other.possibilities);
      } else {
        user.characterPossibilities = 0;
      }
    }
    return data;
  }
  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.players-popout').click(this.renderPopout.bind(this));
    html.find('em.possAdd').click(this.addPossibility.bind(this));
    html.find('em.possMinus').click(this.minusPossibility.bind(this));
    html.find('i.possReset').click(this.resetPossibilities.bind(this));
  }

  /**
   *
   */
  createPopout() {
    const party = new PartySheet();

    return party;
  }

  /**
   *
   */
  createPopoutActive() {
    const party = new PartySheetActive();

    return party;
  }
  /**
   *
   */
  async renderPopout() {
    const all = await Dialog.confirm({
      title: `${game.i18n.localize('torgeternity.partySheet.openParty')}`,
      content: `${game.i18n.localize('torgeternity.partySheet.chooseParty')}`,
    });
    if (all) {
      this.createPopout().render(true);
    } else {
      this.createPopoutActive().render(true);
    }
  }

  /**
   *
   * @param ev
   */
  async addPossibility(ev) {
    if (ev.currentTarget.dataset.targetId === 'GMpossibilities') {
      const GM = game.users.find((user) => user.isGM);
      const newVal = GM.getFlag('torgeternity', 'GMpossibilities') + 1;
      GM.setFlag('torgeternity', 'GMpossibilities', newVal);
      ui.players.render(true);
    } else {
      const targetActor = game.actors.get(ev.currentTarget.dataset.targetId);
      await targetActor.update({
        _id: targetActor._id,
        system: {
          other: {
            possibilities: parseInt(targetActor.system.other.possibilities) + 1,
          },
        },
      });
    }
  }
  /**
   *
   * @param ev
   */
  async minusPossibility(ev) {
    if (ev.currentTarget.dataset.targetId === 'GMpossibilities') {
      const GM = game.users.find((user) => user.isGM);
      const newVal = GM.getFlag('torgeternity', 'GMpossibilities') - 1;
      GM.setFlag('torgeternity', 'GMpossibilities', newVal);
      ui.players.render(true);
    } else {
      const targetActor = game.actors.get(ev.currentTarget.dataset.targetId);
      await targetActor.update({
        _id: targetActor._id,
        system: {
          other: {
            possibilities: parseInt(targetActor.system.other.possibilities) - 1,
          },
        },
      });
    }
  }

  /**
   *
   * @param ev
   */
  resetPossibilities(ev) {
    const possibilitiesDial = new Dialog({
      title: `${game.i18n.localize('torgeternity.possibilitiesReset.name')}`,
      content: `
        
        <div>
        <span>
        ${game.i18n.localize('torgeternity.possibilitiesReset.hint')}
        
            <input id="possibilitiesValue" value="3" type="number"/>
            </span> 
        </div>
      `,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: `${game.i18n.localize('torgeternity.submit.apply')}`,
          callback: (html) => {
            game.users.forEach((user) => {
              if (user.character) {
                const target = game.actors.get(user.character.id);
                const newVal = parseInt(document.getElementById('possibilitiesValue').value);
                target.update({
                  id: target.id,
                  system: {
                    other: {
                      possibilities: newVal,
                    },
                  },
                });
              }
            });
          },
        },
        two: {
          icon: '<i class="fas fa-ban"></i>',
          label: `${game.i18n.localize('torgeternity.submit.cancel')}`,
        },
      },
    });
    possibilitiesDial.render(true);
  }
}
