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
    onChangeDeck(html, event) {
        //getting selected value
        let selectedDeck = event.currentTarget.options[event.currentTarget.selectedIndex].value;

        // checking if other select/options have same value
        for (let option of html.find("option")) {
            if (option.value == selectedDeck && option.closest("select").name != event.currentTarget.getAttribute("name")) {
                if (option.selected) {
                    option.closest("select").classList.add("doubled");
                }
            }
        }
        //checking if other select are not doubled anymore
        for (let select of html.find("select")) {
            if (select.options[select.selectedIndex].value != selectedDeck && select.classList.contains("doubled")) {
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


}