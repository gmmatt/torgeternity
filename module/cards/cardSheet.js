

export default class cardSheet extends ItemSheet {
    constructor(...args) {
        super(...args);

        
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 580,
            classes: ["torgeternity", "sheet", "card"],
           
        });

    }


    get template() {
        return `systems/torgeternity/templates/cards/card.hbs`;
    }


    getData() {
        const data = super.getData();
        return data;
    }

    activateListeners(html) {
        
    }

}