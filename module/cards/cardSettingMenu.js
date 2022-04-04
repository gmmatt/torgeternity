export default class deckSettingMenu extends FormApplication {
    constructor(settings) {
        super();
        this.settings = game.settings.get("torgeternity", "deckSetting")
        this.doubledValues = [];
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/systems/torgeternity/templates/cards/settingMenu.hbs";
        options.top = 300;
        options.left = 500;
        options.submitOnChange = true;
        options.editable = true;
        return options;
    }

    getData() {
        let data = {
            isGM: game.user.isGM,
            deckList: game.cards.contents,
            object: game.settings.get("torgeternity", "deckSetting"),
            stormknights: game.actors.filter(act => act.type == "stormknight"),
            stormknightsHands: {}
        };
        for (let sk of data.stormknights) {
            data.stormknightsHands[sk.id] = game.settings.get("torgeternity", "deckSetting").stormknightsHands[sk.id];
        }
        return mergeObject(super.getData(), data);
    }

    async activateListeners(html) {
        //checking if doubled values
        this.checkDoubled();
        // changing default deck
        html.find(".selectDeck").change(this.onChangeDeck.bind(this, html));
        // assigning user rights for stormknights owners
        html.find("select.stormknightHand").change(this.onChangeHand.bind(this, html));
        //creating new cards decks or piles or hand
        html.find("button.createCards").click(this.onCreateCards.bind(this))

    }
    _updateObject(event, formData) {
        const data = expandObject(formData);
        game.settings.set('torgeternity', 'deckSetting', data);
    }
    onCreateCards(event) {
        event.preventDefault();


        let cardData = {
            type: type,
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        Cards.createDialog();


    }
    onChangeDeck(html, event) {
        //getting selected value

        // checking if other select/options have same value
        this.checkDoubled();
        //checking if other select are not doubled anymore
        for (let select of html.find("select")) {
            if (this.doubledValues.indexOf(select.options[select.selectedIndex].value) == -1) {
                select.classList.remove("doubled")
            }
        }

        //allowing submit if no doubled value
        if (this.element.find(".doubled").length > 0) {
            this.element.find('button[type="submit"]')[0].disabled = true
        } else {
            this.element.find('button[type="submit"]')[0].disabled = false

        }
    }
    onChangeHand(html, event) {
        let actorId = event.currentTarget.getAttribute("name").replace("stormknightsHands.", "");
        let handId = event.currentTarget.options[event.currentTarget.selectedIndex].value;

        let actor = game.actors.get(actorId);
        let hand = game.cards.get(handId);

        let actorsPerm = actor.data.permission;
        // assigning same permissions from actor to hand
        hand.update({
            data: {
                permissions: actorsPerm
            }
        })


    }
    checkDoubled() {
        let selectedValues = []

        for (let select of this.element.find("select")) {
            let value = select.options[select.selectedIndex].value
            selectedValues.push(value);
            let valueCount = selectedValues.filter(val => val == value).length;

            if (valueCount > 1) {
                this.doubledValues.push(value)
            } else {
                if (this.doubledValues.indexOf(value) > -1) {
                    console.log(this.doubledValues.indexOf(value));
                    this.doubledValues.splice(this.doubledValues.indexOf(value), 1);
                }
            }
        }
        for (let select of this.element.find("select")) {
            let value = select.options[select.selectedIndex].value;
            if (this.doubledValues.indexOf(value) > -1) {
                select.classList.add("doubled");
            } else {
                select.classList.remove("doubled");
            }
        }

    }

}