import PartySheet from "./partySheet.js";
import PartySheetActive from "./partySheetActive.js"
export default class TorgeternityPlayerList extends PlayerList {




    get template() {
        return "systems/torgeternity/templates/playerList/playerList.hbs";
    }
    async getData() {
        let data = super.getData();
        data.self = game.user;
        let GM = game.users.find(user => user.isGM)
        data.GMpossibilities = GM.getFlag('torgeternity', 'GMpossibilities');
        for (let user of data.users) {
            if (user.character) {
                let userActor = await game.actors.get(user.character);
                user.characterPossibilities = userActor.system.other.possibilities
            } else {
                user.characterPossibilities = 0
            }

        }
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

    createPopoutActive() {
        let party = new PartySheetActive

        return party;
    }
    async renderPopout() {
        const all = await Dialog.confirm({
            title:"Open party sheet",
            content:"<h3>If you choose YES, it will open with all characters.<br>If you choose NO, it'll open only active characters.</h3>"
        });
        if (all){
            this.createPopout().render(true)
        } else {
            this.createPopoutActive().render(true)
        };
    }


    async addPossibility(ev) {
        if (ev.currentTarget.dataset.targetId === "GMpossibilities") {
            let GM = game.users.find(user => user.isGM)
            let newVal = (GM.getFlag('torgeternity', 'GMpossibilities')) + 1;
            GM.setFlag('torgeternity', 'GMpossibilities', newVal);
            ui.players.render(true);

        } else {
            console.log()
            let targetActor = game.actors.get(ev.currentTarget.dataset.targetId);
            await targetActor.update({
                _id: targetActor._id,
                system: {
                    other: {
                        possibilities: (targetActor.system.other.possibilities) + 1
                    }
                },
            });
        }
    };
    async minusPossibility(ev) {
        if (ev.currentTarget.dataset.targetId === "GMpossibilities") {
            let GM = game.users.find(user => user.isGM)
            let newVal = (GM.getFlag('torgeternity', 'GMpossibilities')) - 1;
            GM.setFlag('torgeternity', 'GMpossibilities', newVal);
            ui.players.render(true);

        } else {
            let targetActor = game.actors.get(ev.currentTarget.dataset.targetId);
            await targetActor.update({
                _id: targetActor._id,
                system: {
                    other: {
                        possibilities: (targetActor.system.other.possibilities) - 1
                    }
                },

            })
        }

    }



    resetPossibilities(ev) {

        let possibilitiesDial = new Dialog({
            title: `${game.i18n.localize("torgeternity.possibilitiesReset.name")}`,
            content: `
        
        <div>
        <span>
        ${game.i18n.localize("torgeternity.possibilitiesReset.hint")}
        
            <input id="possibilitiesValue" value="3" type="number"/>
            </span> 
        </div>
      `,
            buttons: {
                one: {
                    icon: '<i class="fas fa-check"></i>',
                    label: `${game.i18n.localize("torgeternity.submit.apply")}`,
                    callback: (html) => {

                        game.users.forEach(user => {
                            if (user.character) {
                                let target = game.actors.get(user.character.id);
                                let newVal = parseInt(document.getElementById('possibilitiesValue').value)
                                target.update({
                                    id: target.id,
                                    system: {
                                        other: {
                                            possibilities: newVal
                                        }
                                    },
                                })
                            }
                        })
                    }

                },
                two: {
                    icon: '<i class="fas fa-ban"></i>',
                    label: `${game.i18n.localize("torgeternity.submit.cancel")}`,

                },
            },
        });
        possibilitiesDial.render(true);


    }

}