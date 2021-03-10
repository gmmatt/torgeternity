import { torgeternity } from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
import { sheetResize } from "./module/sheetResize.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { toggleViewMode } from "./module/viewMode.js";

import HandedCardsApp from "./module/cards/HandedCardsApp.js";
import {HandedCards} from "./module/cards/HandedCards.js";

import GMDecksApp from "./module/cards/GMDecksApp.js";
import { GMDecks } from "./module/cards/GMDecks.js";

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
  CONFIG.Combat.initiative.formula = "1";
  CONFIG.Combat.entityClass = torgeternityCombat;
  CONFIG.ui.combat = torgeternityCombatTracker;

  //---register items and actors
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("torgeternity", torgeternityItemSheet, {
    makeDefault: true,
  });

  Actors.unregisterSheet("core", ItemSheet);
  Actors.registerSheet("torgeternity", torgeternityActorSheet, {
    makeDefault: true,
  });

  //----------preloading handlebars templates
  preloadTemplates();

  //----------debug hooks
  CONFIG.debug.hooks = true;

  //----socket receiver
  game.socket.on("system.torgeternity", (data) => {
    if (data.msg == "cardPlayed") {
      Cards.cardPlayed(data);
    }
    if (data.msg == "cardReserved") {
      Cards.cardReserved(data);
    }
    if (data.msg == "cardExchangePropose") {
      Cards.cardExchangePropose(data);
    }
    if (data.msg == "cardExchangeValide") {
      Cards.cardExchangeValide(data);
    }
  });
});

//-------------once everything ready
Hooks.on("ready", function () {
  sheetResize();
  toggleViewMode();
  var logo = document.getElementById("logo");
  logo.style.position = "absolute";
  logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.webp");


  //-----applying players card ui:
  if (game.user.data.role == false || game.user.data.role != 4) {
    let user=game.users.get(game.user._id)
    
    ui.HandedCards = new HandedCardsApp();
    ui.HandedCards.render(true);
  };
  //-----applying GM card ui:
  if (game.user.data.role == 4 || game.user.data.role == 3) {
    //init cards GM Decks
    let user=game.users.get(game.user._id)
   
    ui.GMDecks = new GMDecksApp();
    ui.GMDecks.render(true);
  };

 
});
//----all this could be draft in another imported module ?? maybe like ./modules/handlebarsHelpers.js

Handlebars.registerHelper("concatSkillValue", function (skillName) {
  var skillValue = "{{data.skills." + skillName + ".value}}";
  return skillValue;
});

Handlebars.registerHelper("concatAttributeName", function (attributeName) {
  var localName = "torgeternity.attributes." + attributeName;
  return localName;
});

Handlebars.registerHelper("concatSkillName", function (skillName) {
  var localName = "torgeternity.skills." + skillName;
  return localName;
});

Handlebars.registerHelper("concatClearanceLevel", function (clearance) {
  var localClearance = "torgeternity.clearances." + clearance;
  return localClearance;
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));
