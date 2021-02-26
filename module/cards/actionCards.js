export function addListeners(html) {
    html.on('click', 'button#restartDeck', restartActionDeck);
    html.on('click', 'button#drawCard', drawActionDeck);


}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function restartActionDeck() {
    console.log("TORG-----new action card deck");
    CONFIG.torgeternity.gameCards.decks.actionDeck.remainingCards = CONFIG.torgeternity.gameCards.decks.actionDeck.cardList;
    let deck = CONFIG.torgeternity.gameCards.decks.actionDeck;
    deck.playedCards = [];
    deck.remainingCards = deck.cardList;
    shuffle(deck.remainingCards);

    console.log(deck)
    CONFIG.torgeternity.gameCards.decks.actionDeck = deck;


};

function drawActionDeck() {
    console.log(CONFIG.torgeternity.gameCards.decks.actionDeck)
    let deck = CONFIG.torgeternity.gameCards.decks.actionDeck;

    console.log("TORG----- action card drawed")
    var playedCard = deck.remainingCards.splice(0, 1);
    deck.playedCards.push(playedCard[0]);
    CONFIG.torgeternity.gameCards.decks.actionDeck = deck;
    console.log(CONFIG.torgeternity.gameCards.decks.actionDeck)

}