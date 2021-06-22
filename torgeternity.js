'use strict';
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
import { registerTorgSettings } from "./module/settings.js";
import { modifyTokenBars } from "./module/tokenBars.js";
import { registerHelpers } from "./module/handlebarHelpers.js";
import { checkCardSupport } from "./module/checkCardSupport.js";
import torgCombatant from "./module/dramaticScene/torgeternityCombatant.js";


Hooks.once("init", async function () {
  console.log("torgeternity | Initializing Torg Eternity System");

  //----helpers
  registerHelpers();

  //-----system settings
  registerTorgSettings()


  //-------global
  game.torgeternity = {
    rollItemMacro,
    viewMode: true
  };

  CONFIG.torgeternity = torgeternity;
  CONFIG.Item.documentClass = torgeternityItem;
  CONFIG.Actor.documentClass = torgeternityActor;
  CONFIG.statusEffects = torgeternity.statusEffects;

  //--------combats
  CONFIG.Combat.initiative.formula = "1";
  CONFIG.Combat.documentClass = torgeternityCombat;
  CONFIG.ui.combat = torgeternityCombatTracker;
  CONFIG.Combatant.documentClass = torgCombatant;


  //----scenes
  CONFIG.Scene.sheetClass = torgeternitySceneConfig;
  CONFIG.ui.nav = torgeternityNav;


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


  //-----modify token bars


  //----------debug hooks
  // CONFIG.debug.hooks = true;
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
Hooks.once("setup", async function () {
  modifyTokenBars();

})
//-------------once everything ready
Hooks.on("ready", async function () {
  sheetResize();
  toggleViewMode();
  await checkCardSupport();

  //-----applying GM possibilities pool if absent
  if (game.user.isGM && !game.user.getFlag('torgeternity', 'GMpossibilities')) {
    game.user.setFlag('torgeternity', 'GMpossibilities', 0)
  }

  //----load template for welcome message
  let welcomeData = {
    cardModule: game.modules.get("cardsupport"),
    user: game.user
  }
  torgeternity.welcomeMessage = await renderTemplate("systems/torgeternity/templates/welcomeMessage.hbs", welcomeData);

  //----rendering welcome message
  if (game.settings.get("torgeternity", "welcomeMessage") == true) {
    let d = new Dialog({
      title: "Welcome to the Official Torg Eternity System for Foundry VTT!",
      content: torgeternity.welcomeMessage,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: "OK",
        },
        two: {
          icon: '<i class="fas fa-ban"></i>',
          label: "Don't show again",
          callback: () =>
            game.settings.set("torgeternity", "welcomeMessage", false),
        },
      },
    }, {
      left: 100,
      top: 100,
      resizable: true
    });
    d.render(true);
  }


  //----pause image----
  Hooks.on("renderPause", () => {

    let path = game.settings.get("torgeternity", "pauseMedia");
    let img = document.getElementById("pause").firstElementChild;
    path = "./" + path;
    img.style.content = `url(${path})`
  })

  //-------define a dialog for external links
  let externalLinks = new Dialog({
    title: "external links",
    content: "<p>here are some usefull links</p>",
    buttons: {

      one: {
        icon: '<i class="fas fa-expand-arrows-alt"style="font-size:24px"></i>',
        label: "<p>open torg game reference</p>",
        callback: () => {
          new FrameViewer("http://torg-gamereference.com/index.php", {
            title: "torg game reference",
            top: 200,
            left: 200,
            width: 520,
            height: 520,
            resizable: true
          }).render(true);
        }
      },
      two: {
        icon: '<i class="fab fa-discord"style="font-size:24px"></i>',
        label: "<p>join us on discord</p>",
        callback: () => {
          ui.notifications.info("your browser will open a new page to join us on our discord server");
          var windowObjectReference = window.open("https://discord.com/channels/170995199584108546/842809090316828693", "_blank");

        }
      },


      three: {
        icon: '<i class="fas fa-bug" style="font-size:24px"></i>',
        label: "<p>found a bug ?</p>",
        callback: () => {
          ui.notifications.info("your browser will open a new page to complete an issue");
          var windowObjectReference = window.open("https://github.com/gmmatt/torgeternity/issues/new", "_blank");

        }
      },
      four: {
        icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
        label: "<p>publisher website</p>",
        callback: () => {
          ui.notifications.info("your browser will open a new page to complete an issue");
          var windowObjectReference = window.open("https://ulisses-us.com", "_blank");

        }
      }

    }
  },
    {
      width: 400,
      height: 250,
      left: 100,
      top: 20
    }
  );
  //----logo image
  var logo = document.getElementById("logo");
  logo.style.position = "absolute";
  logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.webp");
  //----open links when click on logo
  logo.title = "external links"
  logo.addEventListener("click", function () {
    externalLinks.render(true)
  })



  Hooks.on("hotbarDrop", (bar, data, slot) =>
    createTorgEternityMacro(data, slot)
  );
  /*

  //-----applying players card ui:
  if (game.user.data.role == false || game.user.data.role != 4) {
    let user=game.users.get(game.user.data._id)
    
    ui.HandedCards = new HandedCardsApp();
    ui.HandedCards.render(true);
  };
  //-----applying GM card ui:
  if (game.user.data.role == 4 || game.user.data.role == 3) {
    //init cards GM Decks
    let user=game.users.get(game.user.data._id)
   
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







Hooks.on("renderChatLog", (app, html, data) => {
  //----chat messages listeners
  Chat.addChatListeners(html);


  //-----toggle animation on chat message

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



//----alphabetic sorting in character sheets
Hooks.on("renderActorSheet", (app, html, data) => {

  // alphabetical sorting 
  alphabSort(html, data);
});

Hooks.on('updateActor', (actor, data, options, id) => {
  //updating playerList with users character up-to-date data
  ui.players.render(true);
})
