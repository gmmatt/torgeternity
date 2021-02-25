import * as actionCard from "./cards/actionCards.js";


export function addActionCardsArea(html) {

    //----adding card area
    console.log(html);
    let actionCardArea = document.createElement('div');
    renderTemplate("systems/torgeternity/templates/cards/actionCardsArea.hbs", CONFIG.torgeternity.gameCards.decks.actionDeck).then(content => {
        actionCardArea.id = "actionCardArea";
        actionCardArea.innerHTML = content;
        html.append(actionCardArea);
        //-----adding listenners
        actionCard.addListeners(html);
    });





}