"use strict";
import { torgeternity } from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
import { sheetResize } from "./module/sheetResize.js";
import { preloadTemplates } from "./module/preloadTemplates.js";
import * as torgchecks from "./module/torgchecks.js";
import torgeternityCombat from "./module/dramaticScene/torgeternityCombat.js";
import torgeternityCombatTracker from "./module/dramaticScene/torgeternityCombatTracker.js";
import { alphabSort } from "./module/AlphabeticalSort.js";
//Disabling Player List extension until it can be updated for version 10
import TorgeternityPlayerList from "./module/users/TorgeternityPlayerList.js";
import torgeternitySceneConfig from "./module/torgeternitySceneConfig.js";
import torgeternityNav from "./module/torgeternityNav.js";
import { registerTorgSettings } from "./module/settings.js";
import { modifyTokenBars } from "./module/tokenBars.js";
import { registerHelpers } from "./module/handlebarHelpers.js";
import torgCombatant from "./module/dramaticScene/torgeternityCombatant.js";
import { registerDiceSoNice } from "./module/dice-so-nice.js";
import torgeternityPlayerHand from "./module/cards/torgeternityPlayerHand.js";
import torgeternityPile from "./module/cards/torgeternityPile.js";
import torgeternityDeck from "./module/cards/torgeternityDeck.js";
import torgeternityCardConfig from "./module/cards/torgeternityCardConfig.js";
import { torgeternityCards } from "./module/cards/torgeternityCards.js";
import { testDialog } from "/systems/torgeternity/module/test-dialog.js";
import { hideCompendium } from "./module/hideCompendium.js";
import initTorgControlButtons from "./module/controlButtons.js";
import createTorgShortcuts from "./module/keybinding.js";
import GMScreen from "./module/GMScreen.js";
import { setUpCardPiles } from "./module/cards/setUpCardPiles.js";
import { explode, reroll } from "./module/explode.js";
import { activateStandartScene } from "./module/activateStandartScene.js";
import { torgMigration } from "./module/migrations.js";
import initTextEdidor from "./module/initTextEditor.js";
import { torgeternityMacros } from "./module/macros.js"; 

Hooks.once("init", async function () {
  console.log("torgeternity | Initializing Torg Eternity System");
  //CONFIG.debug.hooks = true; //The Developer Mode module can do this for you without accidentally leaving hooks on for anyone working in your system
  //----helpers
  registerHelpers();

  //-------global
  game.torgeternity = {
    rollItemMacro,
    rollSkillMacro,
    viewMode: true, 
    macros: new torgeternityMacros(),   
  };  
  initTextEdidor();
  CONFIG.torgeternity = torgeternity;
  CONFIG.Item.documentClass = torgeternityItem;
  CONFIG.Actor.documentClass = torgeternityActor;
  CONFIG.statusEffects = torgeternity.statusEffects;
  CONFIG.attributeTypes = torgeternity.attributeTypes;

  //--------combats
  CONFIG.Combat.initiative.formula = "1";
  CONFIG.Combat.documentClass = torgeternityCombat;
  CONFIG.ui.combat = torgeternityCombatTracker;
  CONFIG.Combatant.documentClass = torgCombatant;

  //----scenes
  // CONFIG.Scene.sheetClass = torgeternitySceneConfig;
  DocumentSheetConfig.registerSheet(Scene, "torgeternity", torgeternitySceneConfig, {
    label: "Torg Eternity Scene Config",
    makeDefault: true,
  });
  CONFIG.ui.nav = torgeternityNav;

  //---custom user class
  // Player list disabled for now
  CONFIG.ui.players = TorgeternityPlayerList;

  //---cards
  CONFIG.Cards.documentClass = torgeternityCards;
  CONFIG.cardTypes = torgeternity.cardTypes;

  //---localizing entities labels
  CONFIG.Actor.typeLabels = {
    stormknight: game.i18n.localize("torgeternity.sheetLabels.stormknight"),
    threat: game.i18n.localize("torgeternity.sheetLabels.threat"),
    vehicle: game.i18n.localize("torgeternity.sheetLabels.vehicle"),
  };
  CONFIG.Item.typeLabels = {
    gear: game.i18n.localize("torgeternity.itemSheetDescriptions.generalGear"),
    eternityshard: game.i18n.localize("torgeternity.itemSheetDescriptions.eternityshard"),
    armor: game.i18n.localize("torgeternity.itemSheetDescriptions.armor"),
    shield: game.i18n.localize("torgeternity.itemSheetDescriptions.shield"),
    customAttack: game.i18n.localize("torgeternity.itemSheetDescriptions.customAttack"),
    meleeweapon: game.i18n.localize("torgeternity.itemSheetDescriptions.meleeWeapon"),
    missileweapon: game.i18n.localize("torgeternity.itemSheetDescriptions.missileWeapon"),
    firearm: game.i18n.localize("torgeternity.itemSheetDescriptions.firearm"),
    implant: game.i18n.localize("torgeternity.itemSheetDescriptions.implant"),
    heavyweapon: game.i18n.localize("torgeternity.itemSheetDescriptions.heavyWeapon"),
    vehicle: game.i18n.localize("torgeternity.itemSheetDescriptions.vehicule"),
    perk: game.i18n.localize("torgeternity.itemSheetDescriptions.perk"),
    enhancement: game.i18n.localize("torgeternity.itemSheetDescriptions.enhancement"),
    specialability: game.i18n.localize("torgeternity.itemSheetDescriptions.specialability"),
    "specialability-rollable": game.i18n.localize("torgeternity.itemSheetDescriptions.specialabilityRollable"),
    spell: game.i18n.localize("torgeternity.itemSheetDescriptions.spell"),
    miracle: game.i18n.localize("torgeternity.itemSheetDescriptions.miracle"),
    psionicpower: game.i18n.localize("torgeternity.itemSheetDescriptions.psionicpower"),
    customSkill: game.i18n.localize("torgeternity.itemSheetDescriptions.customSkill"),
    vehicleAddOn: game.i18n.localize("torgeternity.itemSheetDescriptions.vehicleAddOn"),
  };

  ui.GMScreen = new GMScreen();
  // all settings after config
  registerTorgSettings();
  //---register items and actors
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("torgeternity", torgeternityItemSheet, {
    makeDefault: true,
  });

  Actors.unregisterSheet("core", ItemSheet);
  Actors.registerSheet("torgeternity", torgeternityActorSheet, {
    makeDefault: true,
  });

  //---register cards
  DocumentSheetConfig.registerSheet(Cards, "core", torgeternityPlayerHand, {
    label: "Torg Player Hand",
    types: ["hand"],
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Cards, "core", torgeternityPile, {
    label: "Torg Pile",
    types: ["pile"],
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Cards, "core", torgeternityDeck, {
    label: "Torg Deck",
    types: ["deck"],
    makeDefault: true,
  });
  DocumentSheetConfig.registerSheet(Card, "core", torgeternityCardConfig, {
    label: "Torg Eternity Card Configuration",
    types: ["destiny", "drama", "cosm"],
    makeDefault: true,
  });

  //----------preloading handlebars templates
  preloadTemplates();
  // adding special torg buttons
  initTorgControlButtons();
  //create torg shortcuts
  createTorgShortcuts();
});

Hooks.once("setup", async function () {
  modifyTokenBars();
  //changing stutus marker
  //preparing status marker

  if (game.settings.get("core", "language") === "fr") {
    for (let effect of CONFIG.statusEffects) {
      effect.icon = effect.icon.replace(
        "systems/torgeternity/images/status-markers",
        "systems/torgeternity/images/status-markers/fr"
      );
    }
  }
});

Hooks.once("diceSoNiceReady", (dice3d) => {
  registerDiceSoNice(dice3d);
});

//-------------once everything ready
Hooks.on("ready", async function () {
  //migration script
  if (game.user.isGM) torgMigration();

  sheetResize();

  //modifying explosion methode for dices
  Die.prototype.explode = explode;
  Die.prototype.reroll = reroll;

  //adding gmScreen to UI
  ui.GMScreen = new GMScreen();

  //-----applying GM possibilities pool if absent
  if (game.user.isGM && !game.user.getFlag("torgeternity", "GMpossibilities")) {
    game.user.setFlag("torgeternity", "GMpossibilities", 0);
  }

  //----load template for welcome message depending on supported languages
  let lang = game.settings.get("core", "language");
  torgeternity.supportedLanguages.indexOf(lang) == -1 ? (lang = "en") : (lang = lang);

  torgeternity.welcomeMessage = await renderTemplate(`systems/torgeternity/templates/welcomeMessage/${lang}.hbs`);

  //----rendering welcome message
  if (game.settings.get("torgeternity", "welcomeMessage") == true) {
    let d = new Dialog(
      {
        title: "Welcome to the Official Torg Eternity System for Foundry VTT!",
        content: torgeternity.welcomeMessage,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: `${game.i18n.localize("torgeternity.submit.OK")}`,
          },
          two: {
            icon: '<i class="fas fa-ban"></i>',
            label: `${game.i18n.localize("torgeternity.submit.dontShow")}`,
            callback: () => game.settings.set("torgeternity", "welcomeMessage", false),
          },
        },
      },
      {
        left: 100,
        top: 100,
        resizable: true,
      }
    );
    d.render(true);
  }

  //------Ask about hiding nonlocal compendium
  if (
    game.settings.get("torgeternity", "welcomeMessage") == true &&
    !game.settings.get("torgeternity", "hideForeignCompendium")
  ) {
    let d = new Dialog(
      {
        title: game.i18n.localize("torgeternity.dialogWindow.hideForeignCompendium.title"),
        content: game.i18n.localize("torgeternity.dialogWindow.hideForeignCompendium.content"),
        buttons: {
          one: {
            icon: `<i class="fas fa-check"></i>`,
            label: game.i18n.localize("torgeternity.yesNo.true"),
            callback: async () => {
              await game.settings.set("torgeternity", "hideForeignCompendium", true);
              window.location.reload();
            },
          },
          two: {
            icon: '<i class="fas fa-ban"></i>',
            label: game.i18n.localize("torgeternity.yesNo.false"),
          },
        },
      },
      {
        top: 860,
        left: 100,
      }
    );
    d.render(true);
  }
  /*
        for (let [k, v] of game.settings.settings.entries()) {
            if (k == "torgeternity.deckSetting") {
                console.log('______________________ok', { v })
            }
        }
      */
  //----setup cards if needed
  if (game.settings.get("torgeternity", "setUpCards") === true && game.user.isGM) {
    await setUpCardPiles();
  };

  //----reset cards to initial face      
  if (game.user.isGM) Array.from(game.cards).forEach(d => Array.from(d.cards).forEach(c => c.update({ "face": 0 })));
  
  // activation of standart scene
  if (game.scenes.size < 1) {
    activateStandartScene();
  }

  //----pause image----
  //Hooks.on("renderPause", () => {

  // Removing this because it doesn't appear to do anything any longer?

  // let path = game.settings.get("torgeternity", "pauseMedia");
  // let img = document.getElementById("pause").firstElementChild;
  // path = "./" + path;
  // img.style.content = `url(${path})`
  //})

  //-------define a dialog for external links

  let dialData = {
    title: game.i18n.localize("torgeternity.dialogWindow.externalLinks.title"),
    content: game.i18n.localize("torgeternity.dialogWindow.externalLinks.content"),
    buttons: {
      one: {
        icon: '<i class="fas fa-expand-arrows-alt"style="font-size:24px"></i>',
        label: game.i18n.localize("torgeternity.dialogWindow.externalLinks.reference"),
        callback: () => {
          new FrameViewer("http://torg-gamereference.com/index.php", {
            title: "torg game reference",
            top: 200,
            left: 200,
            width: 520,
            height: 520,
            resizable: true,
          }).render(true);
        },
      },
      two: {
        icon: '<i class="fab fa-discord"style="font-size:24px"></i>',
        label: "<p>Discord</p>",
        callback: () => {
          ui.notifications.info(game.i18n.localize("torgeternity.notifications.openDiscord"));
          var windowObjectReference = window.open("https://discord.gg/foundryvtt", "_blank");
        },
      },

      three: {
        icon: '<i class="fas fa-bug" style="font-size:24px"></i>',
        label: game.i18n.localize("torgeternity.dialogWindow.externalLinks.bug"),
        callback: () => {
          ui.notifications.info(game.i18n.localize("torgeternity.notifications.openIssue"));
          var windowObjectReference = window.open("https://github.com/gmmatt/torgeternity/issues/new", "_blank");
        },
      },
      four: {
        icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
        label: game.i18n.localize("torgeternity.dialogWindow.externalLinks.publisher"),
        callback: () => {
          ui.notifications.info(game.i18n.localize("torgeternity.notifications.openUlisses"));
          var windowObjectReference = window.open("https://ulisses-us.com", "_blank");
        },
      },
    },
  };
  let dialOption = {
    width: "auto",
    height: 250,
    left: 100,
    top: 20,
  };
  //adding french links (shamelessly)
  if (game.settings.get("core", "language") == "fr") {
    dialData.buttons.five = {
      icon: '<img src="systems/torgeternity/images/BBE_logo.webp" alt="logo BBE" style="filter:grayscale(1);max-height:3em">',
      label: "<p>Distr. français</p>",
      callback: () => {
        ui.notifications.info("votre navigateur va ouvrir le site de BlackBook Editions dans un nouvel onglet  ");
        var windowObjectReference = window.open("https://www.black-book-editions.fr/catalogue.php?id=668", "_blank");
      },
    };
  }
  let externalLinks = new Dialog(dialData, dialOption);
  //----logo image
  var logo = document.getElementById("logo");
  logo.style.position = "absolute";
  logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.webp");
  //----open links when click on logo
  logo.title = "external links";
  logo.addEventListener("click", function () {
    externalLinks.render(true);
  });

  /*
  //-----applying players card ui:
  if (game.user.role == false || game.user.role != 4) {
    let user=game.users.get(game.user._id)
    
    ui.HandedCards = new HandedCardsApp();
    ui.HandedCards.render(true);
  };
  //-----applying GM card ui:
  if (game.user.role == 4 || game.user.role == 3) {
    //init cards GM Decks
    let user=game.users.get(game.user._id)
   
    ui.GMDecks = new GMDecksApp();
    ui.GMDecks.render(true);
  };
*/
});

//moved out of the setup hook, because it had no need to be in there
Hooks.on("hotbarDrop", (bar, data, slot) => {
  // return true means we are not handling this event, false means we did handle it
  if (data.type !== "Item" && data.type !== "skill" && data.type !== "interaction" && data.type !== "attribute")
    return true;

  createTorgEternityMacro(data, slot);
  return false;
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on("getMonarchHandComponents", (hand, components) => {
  components.markers.push({
    tooltip: `${game.i18n.localize("torgeternity.poolToggle.inPool")}`,
    class: "pool-marker",
    icon: "fas fa-tags",
    color: "#FFFFFF",
    show: (card) => card.getFlag("torgeternity", "pooled"),
  });
  components.controls.push({
    tooltip: `${game.i18n.localize("torgeternity.monarch.discard")}`,
    class: "discard-button",
    icon: "fas fa-inbox",
    color: "#FFFFFF",
    onclick: (event, card) => {
      card.setFlag("torgeternity", "pooled", false);
      if (card.type == "destiny") {
        card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
      } else {
        card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").cosmDiscard));
      }
      card.toMessage({
        content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
          card.img
        }"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize(
          "torgeternity.chatText.discardsCard"
        )} ${card.name}</span></div>`,
      });
    },
  });
  components.controls.push({
    tooltip: `${game.i18n.localize("torgeternity.monarch.broadcast")}`,
    class: "broadcast-button",
    icon: "fas fa-broadcast-tower",
    color: "#FFFFFF",
    onclick: (event, card) => {
      let x = new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
      x.shareImage();
    },
  });
  components.controls.push({
    tooltip: `${game.i18n.localize("torgeternity.monarch.play")}`,
    class: "play-button",
    icon: "fas fa-play",
    color: "#FFFFFF",
    onclick: (event, card) => {
      card.setFlag("torgeternity", "pooled", false);
      if (card.type == "destiny") {
        card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
      } else {
        card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").cosmDiscard));
      }
      card.toMessage({
        content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
          card.img
        }"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize(
          "torgeternity.chatText.playsCard"
        )} ${card.name}</span></div>`,
      });
    },
  });
  components.controls.push({
    class: "pool-toggle",
    tooltip: `${game.i18n.localize("torgeternity.poolToggle.toogle")}`,
    icon: "fas fa-tags",
    color: "#FFFFFF",
    onclick: (event, card) => card.setFlag("torgeternity", "pooled", !card.getFlag("torgeternity", "pooled")),
  });
});

async function createTorgEternityMacro(data, slot) {
  const objData = data.uuid ? fromUuidSync(data.uuid) : data.data;
  // Create the macro command
  let command = null;
  let macro = null;
  let macroName = null;
  let macroImg = null;
  let macroFlag = null;

  if (data.type === "Item") {
    command = `game.torgeternity.rollItemMacro("${objData.name}");`;
    macroName = objData.name;
    macroImg = objData.img;
    macroFlag = "itemMacro";
  } // attribute, skill, interaction
  else {
    const internalSkillName = objData.name;
    const internalAttributeName = objData.attribute;
    const isAttributeTest = internalSkillName === internalAttributeName;
    const isInteractionAttack = data.type === "interaction";

    command = `game.torgeternity.rollSkillMacro("${internalSkillName}", "${internalAttributeName}", ${isInteractionAttack});`;

    const displaySkillName = isAttributeTest ? null : game.i18n.localize("torgeternity.skills." + internalSkillName);
    const displayAttributeName = game.i18n.localize("torgeternity.attributes." + internalAttributeName);

    if (data.type === "skill") macroName = displaySkillName + "/" + displayAttributeName;
    else if (data.type === "attribute") macroName = displayAttributeName;
    else if (data.type === "interaction") macroName = displaySkillName;
    macroFlag = "skillMacro";

    if (data.type === "attribute") {
      // this is an attribute test
      // use built-in foundry icons
      if (internalAttributeName === "charisma") macroImg = "icons/skills/social/diplomacy-handshake.webp";
      else if (internalAttributeName === "dexterity") macroImg = "icons/skills/movement/feet-winged-boots-brown.webp";
      else if (internalAttributeName === "mind") macroImg = "icons/sundries/books/book-stack.webp";
      else if (internalAttributeName === "spirit") macroImg = "icons/magic/life/heart-shadow-red.webp";
      else if (internalAttributeName === "strength") macroImg = "icons/magic/control/buff-strength-muscle-damage.webp";
    } else {
      // not attribute test
      // don't have skill icons yet
      // macroImg = "systems/torgeternity/images/icons/skill-" + internalSkillName + "-icon.png";
    }
  }

  macro = game.macros.find((m) => m.name === macroName && m.command === command);
  if (!macro) {
    // there is a difference between img: null or img: "" and not including img at all
    // the latter results in default macro icon, the others give broken image icon
    // can remove this when we have skill icons
    if (!macroImg) {
      macro = await Macro.create({
        name: macroName,
        type: "script",
        command: command,
        ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
        flags: {
          torgeternity: {
            [macroFlag]: true,
          },
        },
      });
    } else {
      macro = await Macro.create({
        name: macroName,
        type: "script",
        img: macroImg,
        command: command,
        ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
        flags: {
          torgeternity: {
            [macroFlag]: true,
          },
        },
      });
    }
  }

  game.user.assignHotbarMacro(macro, slot);
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
  if (!item) return ui.notifications.warn(game.i18n.localize("torgeternity.notifications.noItemNamed") + itemName);

  // Trigger the item roll
  switch (item.type) {
    case "customAttack":
    case "meleeweapon":
    case "missileweapon":
    case "firearm":
    case "energyweapon":
    case "heavyweapon":
    case "specialability-rollable":
      // The following is copied/pasted/adjusted from _onAttackRoll in torgeternityActorSheet
      var weaponData = item.system;
      var attackWith = weaponData.attackWith;
      var skillData = actor.system.skills[weaponData.attackWith];
      var sizeModifier = 0;
      var vulnerableModifier = 0;
      var targetToughness = 0;
      var targetArmor = 0;
      var targetDodge = 0;
      var targetMelee = 0;
      var targetUnarmed = 0;
      var defaultDodge = false;
      var defaultMelee = false;
      var defaultUnarmed = false;
      var targetDefenseSkill = "Dodge";
      var targetDefenseValue = 0;
      var dnDescriptor = "standard";
      var damageType = weaponData.damageType;
      var adjustedDamage;
      var weaponDamage = weaponData.damage;
      var attributes = actor.system.attributes;
      var attackType = weaponData.damageType;

      // Modify dnDecriptor if target exists
      if (Array.from(game.user.targets).length > 0) {
        var firstTarget = Array.from(game.user.targets).find(t => t.actor.type !== "vehicle")?.actor;
        if (!firstTarget) firstTarget = Array.from(game.user.targets)[0].actor;

        switch (attackWith) {
          case "meleeWeapons":
          case "unarmedCombat":
            firstTarget.items.filter((it) => it.type === "meleeweapon").filter((it) => it.system.equipped).length === 0
              ? (dnDescriptor = "targetUnarmedCombat")
              : (dnDescriptor = "targetMeleeWeapons");
            break;
          case "fireCombat":
          case "energyWeapons":
          case "heavyWeapons":
          case "missileWeapons":
            dnDescriptor = "targetDodge";
            break;
          default:
            dnDescriptor = "targetMeleeWeapons";
        }
        if (firstTarget.type === "vehicle") {
          dnDescriptor = "targetVehicleDefense";
        }
      } else {
        dnDescriptor = "standard";
      }

      //Calculate damage caused by weapon
      switch (damageType) {
        case "flat":
          adjustedDamage = weaponDamage;
          break;
        case "strengthPlus":
          adjustedDamage = parseInt(attributes.strength) + parseInt(weaponDamage);
          break;
        case "charismaPlus":
          adjustedDamage = parseInt(attributes.charisma) + parseInt(weaponDamage);
          break;
        case "dexterityPlus":
          adjustedDamage = parseInt(attributes.dexterity) + parseInt(weaponDamage);
          break;
        case "mindPlus":
          adjustedDamage = parseInt(attributes.mind) + parseInt(weaponDamage);
          break;
        case "spiritPlus":
          adjustedDamage = parseInt(attributes.spirit) + parseInt(weaponDamage);
          break;
        default:
          adjustedDamage = parseInt(weaponDamage);
      }

      var mTest = {
        testType: "attack",
        type: "attack",
        actor: actor.uuid,
        actorType: actor.type,
        item: item,
        attackType: attackType,
        isAttack: true,
        amountBD: 0,
        isFav: skillData.isFav,
        actorPic: actor.img,
        actorName: actor.name,
        skillName: weaponData.attackWith,
        skillBaseAttribute: skillData.baseAttribute,
        skillValue: skillData.value,
        skillAdds: skillData.adds,
        unskilledUse: true,
        rollTotal: 0,
        DNDescriptor: dnDescriptor,
        weaponName: item.name,
        weaponDamageType: weaponData.damageType,
        weaponDamage: weaponData.damage,
        damage: adjustedDamage,
        weaponAP: weaponData.ap,
        applyArmor: true,
        targets: Array.from(game.user.targets),
        applySize: true,
        attackOptions: true,
        darknessModifier: 0,
        chatNote: weaponData.chatNote,
        movementModifier: 0,
      };

      let dialog = new testDialog(mTest);
      dialog.render(true);
      break;
    case "psionicpower":
    case "miracle":
    case "spell":
      var powerData = item.system;
      var skillName = powerData.skill;
      var skillData = actor.system.skills[skillName];
      var dnDescriptor = "standard";
      var isAttack = false;
      var applyArmor = true;
      var applySize = true;
      var powerModifier = 0;

      // Convert yes/no options from sheet into boolean values (or else renderSkillChat gets confused)
      if (powerData.isAttack == "true") {
        isAttack = true;
      } else {
        isAttack = false;
      }

      if (powerData.applyArmor == "true") {
        applyArmor = true;
      } else {
        applyArmor = false;
      }

      if (powerData.applySize == "true") {
        applySize = true;
      } else {
        applySize = false;
      }

      // Set modifier for this power
      if (item.system.modifier > 0 || item.system.modifier < 0) {
        powerModifier = item.system.modifier;
      } else {
        powerModifier = 0;
      }

      // Set difficulty descriptor based on presense of target
      if (Array.from(game.user.targets).length > 0) {
        dnDescriptor = powerData.dn;
      } else {
        dnDescriptor = "standard";
      }

      let test = {
        testType: "power",
        actor: actor.uuid,
        actorPic: actor.img,
        actorName: actor.name,
        actorType: actor.type,
        attackType: "power",
        powerName: item.name,
        powerModifier: powerModifier,
        isAttack: isAttack,
        amountBD: 0,
        skillName: skillName,
        skillBaseAttribute: game.i18n.localize("torgeternity.skills." + skillData.baseAttribute),
        skillAdds: skillData.adds,
        skillValue: skillData.value,
        unskilledUse: false,
        damage: powerData.damage,
        weaponAP: powerData.ap,
        applyArmor: applyArmor,
        darknessModifier: 0,
        DNDescriptor: dnDescriptor,
        type: "power",
        targets: Array.from(game.user.targets),
        applySize: applySize,
        attackOptions: true,
        rollTotal: 0,
        chatNote: "",
      };

      let pdialog = new testDialog(test);
      pdialog.render(true);
      /*
            // this will cause the power to be printed to the chat
            return item.roll({ async: false });
            /* This part is not functional, kept for test purpose, replaced by the following "log" and "ui.notification"
                        var powerData = item.system;
                        var skillData = item.actor.system.skills[powerData.skill];
                        console.log(powerData, skillData);
                        torgchecks.powerRoll({
                            actor: item.actor,
                            item: item,
                            actorPic: item.actor.img,
                            skillName: powerData.skill,
                            skillBaseAttribute: skillData.baseAttribute,
                            skillValue: skillData.value,
                            powerName: item.name,
                            powerAttack: powerData.isAttack,
                            powerDamage: powerData.damage,
                        });
            */
      //console.log("Same action for Psi/Miracles/Spells");
      //ui.notifications.info(game.i18n.localize('torgeternity.notifications.notImplemented'));
      break;
    default:
      // this will cause the item to be printed to the chat
      return item.roll({ async: false });
    //ui.notifications.info(game.i18n.localize('torgeternity.notifications.defaultAction'));
  }
}

/**
 * Create a Macro from a skill, attribute, or interaction (?) drop.
 * Get an existing macro if one exists, otherwise create a new one.
 * @param {string} skillName
 * @param {string} attributeName
 * @param {boolean} isInteractionAttack
 * @return {Promise}
 */
function rollSkillMacro(skillName, attributeName, isInteractionAttack) {
  const speaker = ChatMessage.getSpeaker();
  let actor = null;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const isAttributeTest = skillName === attributeName;
  let skill = null;
  if (!isAttributeTest) {
    const skillNameKey = skillName.toLowerCase(); // skillName required to be internal value
    // would be nice to use display value as an input instead but we can't translate from i18n to internal values
    skill = actor && Object.keys(actor.system.skills).includes(skillNameKey) ? actor.system.skills[skillNameKey] : null;
    if (!skill) return ui.notifications.warn(game.i18n.localize("torgeternity.notifications.noSkillNamed") + skillName);
  }

  const attributeNameKey = attributeName.toLowerCase();
  const attribute =
    actor && Object.keys(actor.system.attributes).includes(attributeNameKey)
      ? actor.system.attributes[attributeNameKey]
      : null;
  if (!attribute) return ui.notifications.warn(game.i18n.localize("torgeternity.notifications.noItemNamed"));
  if (isAttributeTest) {
    // dummy skill object since there's no actual skill in this case
    skill = {
      baseAttribute: attributeNameKey,
      adds: 0,
      value: attribute,
      isFav: actor.system.attributes[attributeNameKey + "IsFav"],
      groupName: "other",
      unskilledUse: 1,
    };
  }

  // calculate the value using the attribute and skill adds, as the attribute might be different
  //    than the skill's current baseAttribute. This assumes the actor is a stormknight - different
  //    logic is needed for threats, who don't have adds.
  let skillValue = attribute;
  if (!isAttributeTest) {
    if (actor.type === "stormknight") {
      skillValue += skill.adds;
    } else if (actor.type == "threat") {
      const otherAttribute = actor.system.attributes[skill.baseAttribute];
      skillValue = Math.max(skill.value, otherAttribute);
    }
  }
  // Trigger the skill roll
  // The following is copied/pasted/adjusted from _onSkillRoll and _onInteractionAttack in torgeternityActorSheet
  // This code needs to be centrally located!!!
  let test = {
    testType: isAttributeTest ? "attribute" : "skill",
    actor: actor.uuid,
    actorPic: actor.img,
    actorName: actor.name,
    actorType: actor.type,
    skillName: isAttributeTest ? attributeName : skillName,
    skillBaseAttribute: game.i18n.localize("torgeternity.attributes." + attributeName),
    skillAdds: skill.adds,
    skillValue: skillValue,
    isAttack: false,
    isFav: skill.isFav,
    targets: Array.from(game.user.targets),
    applySize: false,
    DNDescriptor: "standard",
    attackOptions: false,
    rollTotal: 0,
    unskilledUse: skill.unskilledUse,
    chatNote: "",
    woundModifier: parseInt(-actor.system.wounds.value),
    stymiedModifier: parseInt(actor.system.stymiedModifier),
    darknessModifier: 0, //parseInt(actor.system.darknessModifier),
    type: "skill",
    movementModifier: 0,
  };
  if (isInteractionAttack) {
    test["type"] = "interactionAttack";
    test["testType"] = "interactionAttack";
    test["interactionAttackType"] = skillName;
    test["darknessModifier"] = 0;
    // Darkness seems like it would be hard to determine if it should apply to
    //    skill/attribute tests or not, maybe should be option in dialog?

    // Exit if no target or get target data
    var dnDescriptor;
    if (Array.from(game.user.targets).length > 0) {
      switch (skillName) {
        case "intimidation":
          dnDescriptor = "targetIntimidation";
          break;
        case "maneuver":
          dnDescriptor = "targetManeuver";
          break;
        case "taunt":
          dnDescriptor = "targetTaunt";
          break;
        case "trick":
          dnDescriptor = "targetTrick";
          break;
        default:
          dnDescriptor = "standard";
      }
    } else {
      dnDescriptor = "standard";
    }
    test.DNDescriptor = dnDescriptor;
    test.unskilledUse = true;
  }

  let dialog = new testDialog(test);
  dialog.render(true);
}

Hooks.on("renderCombatTracker", (combatTracker) => {
  const hands = game.cards;
  for (let hand of hands) {
    hand.apps[combatTracker.id] = combatTracker;
  }
});

Hooks.on("changeSidebarTab", (tabDirectory) => {
  if (game.settings.get("torgeternity", "hideForeignCompendium") == true) {
    hideCompendium(game.settings.get("core", "language"), tabDirectory);
  }
});

//----alphabetic sorting in character sheets
Hooks.on("renderActorSheet", (app, html, data) => {
  // alphabetical sorting
  alphabSort(html, data);
});

Hooks.on("updateActor", (actor, change, options, userId) => {
  //updating playerList with users character up-to-date data
  ui.players.render(true);

  if (actor.type === "stormknight") {
    let hand = actor.getDefaultHand();
    //If there is no hand for that SK, and a GM is online, create one
    if (!hand && game.userId === game.users.find((u) => u.isGM && u.active).id) {
      actor.createDefaultHand();
    }
    //If the update includes permissions, sync them to the hand
    if (hand && change.ownership && game.userId === userId) {
      //DO NOT PUT ANYTHING ELSE IN THIS UPDATE! diff:false, recursive:false can easily nuke stuff
      hand.update({ ownership: actor.getHandOwnership() }, { diff: false, recursive: false });
    }
  }
});

// by default creating a  hand for each stormknight
Hooks.on("createActor", async (actor, options, userId) => {
  //run by first active GM. Will be skipped if no GM is present, but that's the best we can do at the moment
  if (actor.type === "stormknight" && game.userId === game.users.find((u) => u.isGM && u.active).id) {
    await actor.createDefaultHand();
  }
});

// un-pool cards of SK when the GM ends the combat encounter
Hooks.on("deleteCombat", async (combat, dataUpdate) => {
  if (!game.user.isGM) return;
  var listCombatants = [];
  var listHandsReset = [];
  //listing of actors in the closing combat
  combat.combatants.forEach((fighter) => listCombatants.push(fighter.actorId));
  //listing of actors in the closing combat
  combat.combatants
    .filter((sk) => sk.actor.type === "stormknight")
    .forEach((fighter) => listCombatants.push(fighter.actorId));
  //listing of hands' actors in closing combat
  listCombatants.forEach((i) => {
    if (!!game.actors.get(i).getDefaultHand()) {
      listHandsReset.push(game.actors.get(i).getDefaultHand());
    }
  });
  //delete the flag that give the pooled condition in each card of each hand
  listHandsReset.forEach((hand) => hand.cards.forEach((card) => card.unsetFlag("torgeternity", "pooled")));
});

Hooks.on("deleteActor", async (actor, data1, data2) => {
  if (!game.user.isGM) return;
  actor.getDefaultHand().delete();
});

Hooks.on("renderChatLog", (app, html, data) => {
  //----chat messages listeners
  Chat.addChatListeners(html);
});

Hooks.on("applyActiveEffect", async (actor, change, current, delta, changes) => {
  if (game.user.isGM) {
    await actor.setFlag("torgeternity", "dexLimit", true);//an idea I keep there, useless
    var custom = change.value.split(/\s+/);//should be strength, need other code and test with other attributes
    var sourceObject = actor.items.find(it => it.uuid === change.effect.origin);
    var neoRequired = sourceObject.system?.minStrength | 0;
    var neo = Math.max(actor?.overrides?.system?.attributes?.[custom[0]] | 0, actor.system.attributes[custom[0]]) - neoRequired;
    if (neo < 0) {
      if (!actor.effects.find(ef => ef.name === "Malus")) {
        let StrengthDebuff = {
          name: "Malus",
          icon: "icons/svg/door-locked-outline.svg",
          tint: "#ff0000",
          duration: { rounds: 100 },
          origin: change.effect.origin,
          changes: [
            {
              key: change.key,
              mode: 2,
              priority: change.priority + 90,
              value: Math.min(neo, 0)
            },
          ]
        };
        await actor.createEmbeddedDocuments("ActiveEffect", [StrengthDebuff])
      }
    }
  }
});

Hooks.on("preCreateActiveEffect", async (effect, changes, data, id) => {
  console.log("Effacé dans le preCreateActiveEffect");
  //if (game.user.isGM) {
  var malus = effect.parent.effects.find(ef => ef.name === "Malus");
  if (malus) {
    try {
      malus.delete();
    }
    catch (e) {
    }
  };
  //}
});

Hooks.on("deleteActiveEffect", async (effect, changes, data, id) => {
  var lim = effect.parent.getFlag("torgeternity", "dexLimit");//not used
  console.log(lim);
  if (game.user.isGM) {
    var malus = effect.parent.effects.find(ef => ef.name === "Malus");
    try {
      malus.delete();
      console.log("Effacé dans le deleteActiveEffect");
    }
    catch (e) {
    }
  }
});