import { renderSkillChat } from "./torgchecks.js";
import { torgBD } from "./torgchecks.js";
import {skillDialog} from "/systems/torgeternity/module/skill-dialog.js";
import {skillUpdate} from "/systems/torgeternity/module/skill-update.js";
import {attackUpdate} from "/systems/torgeternity/module/attack-update.js";


export function addChatListeners(html) {
    html.on('click', 'a.roll-possibility',onPossibility);
    html.on('click', 'a.roll-up',onUp);
    html.on('click', 'a.roll-hero',onHero);
    html.on('click', 'a.roll-drama',onDrama);
    html.on('click', 'a.add-plus3',onPlus3);
    html.on('click', 'a.add-bd',onBd);
    html.on('click', 'a.modifier-label',onModifier)
    
}

function onPossibility(event) {

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")


    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    if (diceroll.total < 10) {
        test.possibilityTotal += 10
    } else {
        test.possibilityTotal += diceroll.total
    };
    // diceroll.toMessage();
    test.diceroll = diceroll

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.possibility")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onUp(event) {

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    //Roll for Up
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    test.upTotal = diceroll.total
    // diceroll.toMessage();
    test.diceroll = diceroll;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.up")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}

function onHero(event) {

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    //Increase cards played by 1
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    //Add 1 to cards played
    test.cardsPlayed++;

    //Nullify Diceroll
    test.diceroll = null;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.bonusCard")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onBd(event) {

    const parentMessageId =event.currentTarget.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    var finalValue = torgBD();
    
    var newDamage = parseInt(test.damage) + parseInt(finalValue.total);
    test.damage = newDamage;
    test.diceroll = finalValue;

    test.chatTitle = `${game.i18n.localize("torgeternity.chatText.bonusDamage")}`;
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}

function onModifier(event) {

    const parentMessageId =event.currentTarget.offsetParent.offsetParent.offsetParent.dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId)
    var test = parentMessage.getFlag("torgeternity", "test")

    if (test.testType === "skill" || test.testType === "power") {
        let testDialog = new skillUpdate(test);
        testDialog.render(true)
    } else {
        let testDialog = new attackUpdate(test);
        testDialog.render(true)
    }
        

}
