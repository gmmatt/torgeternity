import Deck from './decks.js';


export class cardArea extends FormApplication {

    constructor(...args) {
        super(...args);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['form', 'card-area'],
            popOut: true,
            closeOnSubmit: true,
            template: `systems/torgeternity/templates/cards/cardArea.hbs`,
            id: 'cardArea',
            title: 'card area',
            width: 400,
            height: 600,
            left: 3,
            top: 20
        });
    }

    getData() {
        super.getData();
        return 

    }

 
    activateListeners(html) {
       

        html.find('button.addDeck')[0].addEventListener("click", () => {
            this.addDeck();
        });
        html.find('button.clearArea')[0].addEventListener("click", () => {
            this.clearArea();
        });
    };

     addDeck() {
         
        let activeDeck = new Deck;
        
        this.render(true)
return this.deck = activeDeck;

    };
     clearArea() {
        console.log('clearing deck')
        data.deck = null;

    }

}