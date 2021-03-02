import {
    torgeternity
} from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
import {
    sheetResize
} from "./module/sheetResize.js";
import {
    preloadTemplates
} from "./module/preloadTemplates.js";
import {
    toggleViewMode
} from "./module/viewMode.js";
import * as Cards from "./module/cards.js";
import torgeternityCombat from "./module/dramaticScene/torgeternityCombat.js";
import torgeternityCombatTracker from "./module/dramaticScene/torgeternityCombatTracker.js";


Hooks.once("init", async function () {
    console.log("torgeternity | Initializing Torg Eternity System");

    //-------global

    CONFIG.torgeternity = torgeternity;


    CONFIG.Item.entityClass = torgeternityItem;
    CONFIG.Actor.entityClass = torgeternityActor;
    CONFIG.statusEffects = torgeternity.statusEffects;


    //--------combats
    CONFIG.Combat.initiative.formula = "0";
    CONFIG.Combat.entityClass=torgeternityCombat;
    CONFIG.ui.combat=torgeternityCombatTracker;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("torgeternity", torgeternityItemSheet, {
        makeDefault: true
    });

    Actors.unregisterSheet("core", ItemSheet);
    Actors.registerSheet("torgeternity", torgeternityActorSheet, {
        makeDefault: true
    });


    //----------preloading handlebars templates  
    preloadTemplates();


    //----------debug hooks
    CONFIG.debug.hooks = true;

    //----socket receiver
    game.socket.on("system.torgeternity", data => {
        if (data.msg == 'cardPlayed') {
           Cards.cardPlayed(data);
        }
        if (data.msg == 'cardReserved') {
            Cards.cardReserved(data);
         }
         if (data.msg == 'cardExchangePropose') {
            Cards.cardExchangePropose(data);
         }
         if (data.msg == 'cardExchangeValide') {
            Cards.cardExchangeValide(data);
         }
     });

});

//-------------once everything ready
Hooks.once("ready", function () {
    sheetResize();
    toggleViewMode();

    var logo = document.getElementById("logo");
    logo.style.position = "fixe"
    logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.png");
  
});
//----all this could be draft in another imported module ?? maybe like ./modules/handlebarsHelpers.js

Handlebars.registerHelper("concatSkillValue", function (skillName) {
    var skillValue = "{{data.skills." + skillName + ".value}}";
    return skillValue;
});

Handlebars.registerHelper("concatAttributeName", function (attributeName) {
    var localName = "torgeternity.attributes." + attributeName
    return localName;
});

Handlebars.registerHelper("concatSkillName", function (skillName) {
    var localName = "torgeternity.skills." + skillName
    return localName;
})

Handlebars.registerHelper("concatClearanceLevel", function (clearance) {
    var localClearance = "torgeternity.clearances." + clearance;
    return localClearance;
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));



