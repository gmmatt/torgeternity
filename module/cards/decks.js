import Card from './card.js';
export default class Deck {

    constructor() {
        this.type = "drama Deck";
        this.cards = [];
        this.template = 'systems/torgeternity/templates/cards/deck.hbs';
    };
    shuffle (){
        var i, j, tmp;
        for (i = this.cards.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            tmp = tab[i];
            this.cards[i] = tab[j];
            this.cards[j] = tmp;
        }
        return tab;
    }
   
}