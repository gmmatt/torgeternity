import { renderSkillChat } from "./torgchecks.js";
import { torgBD } from "./torgchecks.js";


export function addChatListeners(html) {
    html.on('click', 'a.roll-possibility',onPossibility);
    html.on('click', 'a.roll-up',onUp);
    html.on('click', 'a.roll-hero',onHero);
    html.on('click', 'a.roll-drama',onDrama);
    html.on('click', 'a.add-plus3',onPlus3);
    html.on('click', 'a.add-bd',onBd)
    
}

function onPossibility(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').roll();
    if (diceroll.total < 10) {
        test.possibilityTotal = 10
    } else {
        test.possibilityTotal = diceroll.total
    };
    // diceroll.toMessage();
    test.diceroll = diceroll

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.possibility")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onUp(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    //Roll for Up
    var diceroll = new Roll('1d20x10x20').roll();
    test.upTotal = diceroll.total
    // diceroll.toMessage();
    test.diceroll = diceroll;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.up")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}

function onHero(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').roll();
    if (diceroll.total < 10) {
        test.heroTotal = 10
    } else {
        test.heroTotal = diceroll.total
    };
    // diceroll.toMessage();
    test.diceroll=diceroll

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.heroCard")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onDrama(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    //Increase cards played by 1
    var diceroll = new Roll('1d20x10x20').roll();
    if (diceroll.total < 10) {
        test.dramaTotal = 10
    } else {
        test.dramaTotal = diceroll.total
    };
    // diceroll.toMessage();
    test.diceroll=diceroll

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.dramaCard")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onPlus3(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    //Add 1 to cards played
    test.cardsPlayed++;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.bonusCard")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onBd(event) {
    var test = {
        actor: event.currentTarget.dataset.actor,
        actorPic: event.currentTarget.dataset.actorPic,
        actorType: event.currentTarget.dataset.actorType,
        skillName: event.currentTarget.dataset.skillName,
        skillValue: event.currentTarget.dataset.skillValue,
        testType: event.currentTarget.dataset.testType,
        unskilledUse: event.currentTarget.dataset.unskilledUse,
        skillAdds: event.currentTarget.dataset.skillAdds,
        skillBaseAttribute: event.currentTarget.dataset.skillBaseAttribute,
        rollTotal: event.currentTarget.dataset.rollTotal,
        woundModifier: event.currentTarget.dataset.woundModifier,
        stymiedModifier: event.currentTarget.dataset.stymiedModifier,
        sizeModifier: event.currentTarget.dataset.sizeModifier,
        vulnerableModifier: event.currentTarget.dataset.vulnerableModifier,
        possibilityTotal: event.currentTarget.dataset.possibilityTotal,
        upTotal: event.currentTarget.dataset.upTotal,
        heroTotal: event.currentTarget.dataset.heroTotal,
        dramaTotal: event.currentTarget.dataset.dramaTotal,
        cardsPlayed: event.currentTarget.dataset.cardsPlayed,
        damage: event.currentTarget.dataset.damage,
        powerAttack: event.currentTarget.dataset.powerAttack
    };

    var finalValue = torgBD();
    
    var newDamage = parseInt(test.damage) + parseInt(finalValue);
    test.damage = newDamage;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.bonusDamage")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}
