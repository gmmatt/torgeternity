import { renderSkillChat } from "./torgchecks.js";
import { torgBD } from "./torgchecks.js";
import { torgDamage } from "./torgchecks.js";
import { applyDamages } from "./torgchecks.js";
import {soakDamages } from "./torgchecks.js";
import {testDialog} from "/systems/torgeternity/module/test-dialog.js";
import {skillUpdate} from "/systems/torgeternity/module/skill-update.js";
import {attackUpdate} from "/systems/torgeternity/module/attack-update.js";
import {interactionUpdate} from "/systems/torgeternity/module/interaction-update.js";
import {testUpdate} from "/systems/torgeternity/module/test-update.js"


export function addChatListeners(html) {
    html.on('click', 'a.roll-fav',onFavored);
    html.on('click', 'a.roll-possibility',onPossibility);
    html.on('click', 'a.roll-up',onUp);
    html.on('click', 'a.roll-hero',onHero);
    html.on('click', 'a.roll-drama',onDrama);
    html.on('click', 'a.add-plus3',onPlus3);
    html.on('click', 'a.add-bd',onBd);
    html.on('click', 'a.modifier-label',onModifier);
    html.on("click", 'a.applyDam' , applyDam);
    html.on("contextmenu", 'a.applyDam' , adjustDam);
    html.on("click", 'a.soakDam' , soakDam)
}

function onFavored(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");

    //reRoll because favored
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    test.diceroll = diceroll;
    test.rollTotal = Math.max(test.diceroll.total, 1.1);
    test.isFav = false;

    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onPossibility(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    //Roll for Possibility
    //possibilities is allowed 2 times (case in Nile Empire)
    if (test.possibilityTotal > 0) {
        test.possibilityStyle = "pointer-events:none;color:gray";
    } else {
        test.chatTitle += "*";
    }
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    if (test.disfavored) {
        test.possibilityTotal = 0.1;
        test.disfavored = false;
        test.chatNote += "You were disfavored, first bonus die has been cancelled. ";
    } else {test.possibilityTotal = Math.max(10,diceroll.total,test.possibilityTotal)};
    test.diceroll = diceroll

    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onUp(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    //Roll for Up
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    if (test.disfavored) {
        test.upTotal = 0.1;
        test.disfavored = false;
        test.chatNote += "You were disfavored, first bonus die has been cancelled. ";
    } else {test.upTotal = diceroll.total};
    test.diceroll = diceroll;

    test.chatTitle += "*";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}

function onHero(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    //Roll for Possibility
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    if (test.disfavored) {
        test.heroTotal = 0.1;
        test.disfavored = false;
        test.chatNote += "You were disfavored, first bonus die has been cancelled. ";
    } else if (diceroll.total < 10) {
        test.heroTotal = 10
    } else {test.heroTotal = diceroll.total};
    test.diceroll=diceroll

    test.chatTitle += "*";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onDrama(event) {

    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    //Increase cards played by 1
    var diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    if (test.disfavored) {
        test.dramaTotal = 0.1;
        test.disfavored = false;
        test.chatNote += "You were disfavored, first bonus die has been cancelled. ";
    } else if (diceroll.total < 10) {
        test.dramaTotal = 10
    } else {test.dramaTotal = diceroll.total};
    test.diceroll=diceroll

    test.chatTitle += "*";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onPlus3(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    //Add 1 to cards played
    test.cardsPlayed++;

    //Nullify Diceroll
    test.diceroll = null;

    test.unskilledLabel = "display:none";

    renderSkillChat(test);
}

function onBd(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    test.parentId = parentMessageId;
    parentMessage.setFlag("torgeternity", "test");
    test.isFavStyle = "pointer-events:none;color:gray;display:none";

    var finalValue = torgBD();
    
    var newDamage = parseInt(test.damage) + parseInt(finalValue.total);
    test.damage = newDamage;
    test.diceroll = finalValue;

    test.chatTitle += "+BD";
    test.unskilledLabel = "display:none";

    renderSkillChat(test);

}

function onModifier(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test")

    let testDialog = new testUpdate(test);
    testDialog.render(true)

}

async function applyDam(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    let dama = test.damage;
    let toug = test.targetAdjustedToughness;
    applyDamages(torgDamage(dama, toug)); //Need to keep target from test
}

async function soakDam(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    //if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {return};
    var soaker = game.user.character ??  Array.from(game.user.targets)[0].actor;
    console.log(soaker);
    soakDamages(soaker);
}

async function adjustDam(event) {
    const parentMessageId = event.currentTarget.closest(".chat-message").dataset.messageId;
    var parentMessage = game.messages.find( ({id}) => id === parentMessageId);
    if (!game.user.isGM) {return};
    var test = parentMessage.getFlag("torgeternity", "test");
    let dama = test.damage;
    let toug = test.targetAdjustedToughness;
    console.log(torgDamage(dama, toug));
    var newDamages = torgDamage(dama, toug);
    var oldWounds = newDamages.wounds;
    var oldShocks = newDamages.shocks;
    var newWounds, newShocks
    const content = `<p>You can modify the damages here</p> <hr>
    <form>
    <div class="form-group"><label for="nw">New Wounds</label>
    <div class="form-fields"><input type="number" id="nw" value=${oldWounds}></input></div></div>
    <div class="form-group"><label for="ns">New Shocks</label>
    <div class="form-fields"><input type="number" id="ns" value=${oldShocks}></input></div></div>
    </form>`;
    await new Dialog({
    content,
    title: "Choose damages inflicted",
    buttons: {go: {
        icon: `<i class="fas fa-check"></i>`,
        label: "Confirm",
        callback: async (html) => {
        newWounds = Number(html[0].querySelector("input[id=nw]").value);
        newShocks = Number(html[0].querySelector("input[id=ns]").value);
        // do calculation here to get x and y, then do following function:
        console.log(newWounds + " "+ newShocks);   
        newDamages.wounds = newWounds;
        newDamages.shocks = newShocks;
        console.log(newDamages);
        applyDamages(newDamages)
        }
    }},
    default: "go"
    }).render(true);
}