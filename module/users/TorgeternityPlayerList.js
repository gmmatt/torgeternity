import PartySheet from "./partySheet.js"
export default class TorgeternityPlayerList extends PlayerList {




  get template() {
    return "systems/torgeternity/templates/playerList/playerList.hbs";
  }
  getData() {
    let data = super.getData();
    data.self = game.user;
    let GM = game.users.find(user => user.isGM)
    data.GMpossibilities = GM.getFlag('torgeternity', 'GMpossibilities')
    return data
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".players-popout").click(this.renderPopout.bind(this));

    html.find('em.possAdd').click(this.addPossibility.bind(this));
    html.find('em.possMinus').click(this.minusPossibility.bind(this));
    html.find('i.possReset').click(this.resetPossibilities.bind(this));
  }


  createPopout() {
    let party = new PartySheet

    return party;
  }

  renderPopout() {
    this.createPopout().render(true);
  }


  async addPossibility(ev) {
    if (ev.currentTarget.getAttribute("data-targetId") === "GMpossibilities") {
      let GM = game.users.find(user => user.isGM)
      let newVal = (GM.getFlag('torgeternity', 'GMpossibilities')) + 1;
      GM.setFlag('torgeternity', 'GMpossibilities', newVal);
      ui.players.render(true);

    } else {
      let targetActor = game.actors.get(ev.currentTarget.getAttribute("data-targetId"));
      console.log(targetActor)
      await targetActor.update({
        _id: targetActor.data._id,
        data: {
          other: {
            posibilities: (targetActor.data.data.other.posibilities) + 1
          }
        },
      });
    }
  };
  async minusPossibility(ev) {
    if (ev.currentTarget.getAttribute("data-targetId") === "GMpossibilities") {
      let GM = game.users.find(user => user.isGM)
      let newVal = (GM.getFlag('torgeternity', 'GMpossibilities')) - 1;
      GM.setFlag('torgeternity', 'GMpossibilities', newVal);
      ui.players.render(true);

    } else {
      let targetActor = game.actors.get(ev.currentTarget.getAttribute("data-targetId"));
      await targetActor.update({
        _id: targetActor.data._id,
        data: {
          other: {
            posibilities: (targetActor.data.data.other.posibilities) - 1
          }
        },

      })
    }

  }



  resetPossibilities(ev) {

    let possibilitiesDial = new Dialog({
      title: "reseting StormKnights possibilities",
      content: `
        
        <div>
        <span>
        How many possibilities should the StormKnights get
            <input id="possibilitiesValue" value="3" type="number"/>
            </span> 
        </div>
      `,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "Apply",
          callback: (html) => {

            game.users.forEach(user => {
              if (user.character) {
                let target = game.actors.get(user.character.data._id);
                let newVal = parseInt(document.getElementById('possibilitiesValue').value)
                target.update({
                  _id: target.data._id,
                  data: {
                    other: {
                      posibilities: newVal
                    }
                  },
                })
              }
            })
          }

        },
        two: {
          icon: '<i class="fas fa-ban"></i>',
          label: "Cancel",

        },
      },
    });
    possibilitiesDial.render(true);


  }

}
