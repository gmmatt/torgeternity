import { torgeternity } from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
import { sheetResize } from "./module/sheetResize.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import { toggleViewMode } from "./module/viewMode.js";
import * as torgchecks from "./module/torgchecks.js";
import torgeternityCombat from "./module/dramaticScene/torgeternityCombat.js";
import torgeternityCombatTracker from "./module/dramaticScene/torgeternityCombatTracker.js";
import { alphabSort } from "./module/AlphabeticalSort.js";
import TorgeternityPlayerList from "./module/users/TorgeternityPlayerList.js";
import torgeternitySceneConfig from "./module/torgeternitySceneConfig.js";
import torgeternityNav from "./module/torgeternityNav.js";


Hooks.once("init", async function () {
  console.log("torgeternity | Initializing Torg Eternity System");

  //-----system settings

  game.settings.register("torgeternity", "animatedChat", {
    // game.setting.register("NameOfTheModule", "VariableName",
    name: "chat card animation", // Register a module setting with checkbox
    hint: "If checked, enable chat card animations. changes will reload the app", // Description of the settings
    scope: "world", // This specifies a client-stored setting
    config: true, // This specifies that the setting appears in the configuration view
    type: Boolean,
    default: true, // The default value for the setting
    onChange: () => window.location.reload()
  });
  
  //-------global
  game.torgeternity = {
    rollItemMacro,
  };

  CONFIG.torgeternity = torgeternity;
  CONFIG.Item.entityClass = torgeternityItem;
  CONFIG.Actor.entityClass = torgeternityActor;
  CONFIG.statusEffects = torgeternity.statusEffects;

  //--------combats
  CONFIG.Combat.initiative.formula = "1";
  CONFIG.Combat.entityClass = torgeternityCombat;
  CONFIG.ui.combat = torgeternityCombatTracker;

  CONFIG.Scene.sheetClass=torgeternitySceneConfig;
  CONFIG.ui.nav=torgeternityNav;

  
  //---custom user class
  CONFIG.ui.players = TorgeternityPlayerList;

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
  /*
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
*/
});

//-------------once everything ready
Hooks.on("ready", function () {
  sheetResize();
  toggleViewMode();
  displayAxioms();
  var logo = document.getElementById("logo");
  logo.style.position = "absolute";
  logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.webp");

  //toggle off chatcard animation:

  Hooks.on("hotbarDrop", (bar, data, slot) =>
    createTorgEternityMacro(data, slot)
  );
  /*

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

*/
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

async function createTorgEternityMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data))
    return ui.notifications.warn(
      "You can only create macro buttons for owned Items"
    );
  const itemData = data.data;
  // Create the macro command
  const command = `game.torgeternity.rollItemMacro("${itemData.name}");`;
  let macro = game.macros.entities.find(
    (m) => m.name === itemData.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: itemData.name,
      type: "script",
      img: itemData.img,
      command: command,
      flags: { "torgeternity.itemMacro": true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item)
    return ui.notifications.warn(
      `Your controlled Actor does not have an item named ${itemName}`
    );

  // Trigger the item roll
  switch (item.data.type) {
    case "customAttack":
    case "meleeweapon":
    case "missileweapon":
    case "firearm":
    case "heavyweapon":
    case "heavyweapon":
      var weaponData = item.data.data;
      var skillData = item.actor.data.data.skills[weaponData.attackWith];
      torgchecks.weaponAttack({
        actor: item.actor,
        item: item,
        actorPic: item.actor.data.img,
        skillName: weaponData.attackWith,
        skillBaseAttribute: skillData.baseAttribute,
        skillValue: skillData.value,
        unskilledUse: skillData.unskilledUse,
        strengthValue: item.actor.data.data.attributes.strength,
        charismaValue: item.actor.data.data.attributes.charisma,
        dexterityValue: item.actor.data.data.attributes.dexterity,
        mindValue: item.actor.data.data.attributes.mind,
        spiritValue: item.actor.data.data.attributes.spirit,
        weaponName: item.data.name,
        weaponDamageType: weaponData.damageType,
        weaponDamage: weaponData.damage,
      });
      break;
    case "psionicpower":
    case "miracle":
    case "spell":
      var powerData = item.data.data;
      var skillData = item.actor.data.data.skills[powerData.skill];
      console.log(powerData, skillData);
      torgchecks.powerRoll({
        actor: item.actor,
        item: item,
        actorPic: item.actor.data.img,
        skillName: powerData.skill,
        skillBaseAttribute: skillData.baseAttribute,
        skillValue: skillData.value,
        powerName: item.data.name,
        powerAttack: powerData.isAttack,
        powerDamage: powerData.damage,
      });
      break;

    default:
      return item.roll();
  }
}

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

Handlebars.registerHelper("concatSpecialAbility", function (description) {
  // Removes <p> and </p> from the beginning and end of special ability descriptions so that they appear inline on threat sheet
  if (description.startsWith("<p>")) {
    var updatedDescription;
    var endPoint = description.length;
    updatedDescription = description.substr(3, endPoint);
    return updatedDescription;
  } else {
    return description;
  }
});

Hooks.on("renderChatLog", (app, html, data) => {
  Chat.addChatListeners(html);

  if (game.settings.get("torgeternity", "animatedChat") == false) {
    let messFlips = html.find("li.flip-card");
    for (let mes of messFlips) {
      mes.classList.remove("flip-card");
    }
  }
  if (game.settings.get("torgeternity", "animatedChat") == true) {
    let messFlips = html.find("li.chat-message");
    for (let mes of messFlips) {
      mes.classList.add("flip-card");
    }
  }
});
Hooks.on("renderChatMessage", (mess, html, data) => {
  if (game.settings.get("torgeternity", "animatedChat") == true) {
    html[0].classList.add("flip-card");
  }
});

Hooks.on("renderActorSheet", (app, html, data) => alphabSort(html, data));
