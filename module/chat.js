import { renderSkillChat } from "./torgchecks.js";


export function addChatListeners(html) {
    html.on('click', 'a.roll-possibility',onPossibility);
    html.on('click', 'a.roll-up',onUp);
    
}

function onPossibility(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed
    };

    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').roll();
    if (diceroll < 10) {
        test.possibilityTotal = 10
    } else {
        test.possibilityTotal = diceroll.total
    };
    diceroll.toMessage();

    test.chatTitle = "Possibility";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onUp(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed
    };

    //Roll for Up
    var diceroll = new Roll('1d20x10x20').roll();
    test.upTotal = diceroll.total
    diceroll.toMessage();

    test.chatTitle = "Up";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}