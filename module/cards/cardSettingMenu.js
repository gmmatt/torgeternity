export default class deckSettingMenu extends FormApplication {
    constructor(settings) {
        super();
        this.settings = game.settings.get("torgeternity", "deckSetting")

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
            deckList: game.cards.contents,
            object: game.settings.get("torgeternity", "deckSetting")
        };

        return mergeObject(super.getData(), data);
    }

    async activateListeners(html) {
        html.find(".selectDeck").change(this.onChangeDeck.bind(this, html));


    }
    _updateObject(event, formData) {
        const data = expandObject(formData);
        game.settings.set('torgeternity', 'deckSetting', data);
    }
}