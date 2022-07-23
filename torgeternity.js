'use strict';
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
import { attackDialog } from "/systems/torgeternity/module/attack-dialog.js"; //Added
import { testDialog } from "/systems/torgeternity/module/test-dialog.js";
import { interactionDialog } from "/systems/torgeternity/module/interaction-dialog.js";
import { hideCompendium } from './module/hideCompendium.js';
import initTorgControlButtons from './module/controlButtons.js';
import createTorgShortcuts from './module/keybinding.js';
import GMScreen from './module/GMScreen.js'
import { setUpCardPiles } from './module/cards/setUpCardPiles.js';
import { explode } from './module/explode.js';
import { activateStandartScene } from './module/activateStandartScene.js'
import { torgMigration } from "./module/migrations.js"


Hooks.once("init", async function() {
    console.log("torgeternity | Initializing Torg Eternity System");
    //CONFIG.debug.hooks = true; //The Developer Mode module can do this for you without accidentally leaving hooks on for anyone working in your system
    //----helpers
    registerHelpers();


    //-------global
    game.torgeternity = {
        rollItemMacro,
        rollSkillMacro,
        viewMode: true
    };

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
    DocumentSheetConfig.registerSheet(Scene, 'torgeternity', torgeternitySceneConfig, {label: "Torg Eternity Scene Config", makeDefault: true});
    CONFIG.ui.nav = torgeternityNav;

    //---custom user class
    CONFIG.ui.players = TorgeternityPlayerList;

    //---cards
    CONFIG.Cards.documentClass = torgeternityCards;
    CONFIG.cardTypes = torgeternity.cardTypes;



    //---localizing entities labels
    CONFIG.Actor.typeLabels = {
        stormknight: game.i18n.localize("torgeternity.sheetLabels.stormknight"),
        threat: game.i18n.localize("torgeternity.sheetLabels.threat")
    }
    CONFIG.Item.typeLabels = {

        "gear": game.i18n.localize("torgeternity.itemSheetDescriptions.generalGear"),
        "eternityshard": game.i18n.localize("torgeternity.itemSheetDescriptions.eternityshard"),
        "armor": game.i18n.localize("torgeternity.itemSheetDescriptions.armor"),
        "shield": game.i18n.localize("torgeternity.itemSheetDescriptions.shield"),
        "customAttack": game.i18n.localize("torgeternity.itemSheetDescriptions.customAttack"),
        "meleeweapon": game.i18n.localize("torgeternity.itemSheetDescriptions.meleeWeapon"),
        "missileweapon": game.i18n.localize("torgeternity.itemSheetDescriptions.missileWeapon"),
        "firearm": game.i18n.localize("torgeternity.itemSheetDescriptions.firearm"),
        "implant": game.i18n.localize("torgeternity.itemSheetDescriptions.implant"),
        "heavyweapon": game.i18n.localize("torgeternity.itemSheetDescriptions.heavyWeapon"),
        "vehicle": game.i18n.localize("torgeternity.itemSheetDescriptions.vehicule"),
        "perk": game.i18n.localize("torgeternity.itemSheetDescriptions.perk"),
        "enhancement": game.i18n.localize("torgeternity.itemSheetDescriptions.enhancement"),
        "specialability": game.i18n.localize("torgeternity.itemSheetDescriptions.specialability"),
        "specialability-rollable": game.i18n.localize("torgeternity.itemSheetDescriptions.specialabilityRollable"),
        "spell": game.i18n.localize("torgeternity.itemSheetDescriptions.spell"),
        "miracle": game.i18n.localize("torgeternity.itemSheetDescriptions.miracle"),
        "psionicpower": game.i18n.localize("torgeternity.itemSheetDescriptions.psionicpower"),
        "customSkill": game.i18n.localize("torgeternity.itemSheetDescriptions.customSkill")

    }

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
    DocumentSheetConfig.registerSheet(Cards, "core", torgeternityPlayerHand, { label: "Torg Player Hand", types: ["hand"], makeDefault: true });
    DocumentSheetConfig.registerSheet(Cards, "core", torgeternityPile, { label: "Torg Pile", types: ["pile"], makeDefault: true });
    DocumentSheetConfig.registerSheet(Cards, "core", torgeternityDeck, { label: "Torg Deck", types: ["deck"], makeDefault: true });
    DocumentSheetConfig.registerSheet(Card, "core", torgeternityCardConfig, { label: "Torg Eternity Card Configuration", types: ["destiny", "drama", "cosm"], makeDefault: true })


    //----------preloading handlebars templates
    preloadTemplates();
    // adding special torg buttons
    initTorgControlButtons();
    //create torg shortcuts
    createTorgShortcuts();



});

Hooks.once("setup", async function() {

    modifyTokenBars();
    //changing stutus marker 
    //preparing status marker

    if (game.settings.get("core", "language") === "fr") {
        for (let effect of CONFIG.statusEffects) {
            effect.icon = effect.icon.replace("systems/torgeternity/images/status-markers", "systems/torgeternity/images/status-markers/fr")
        }
    }


});

Hooks.once("diceSoNiceReady", (dice3d) => {
    registerDiceSoNice(dice3d);
});

//-------------once everything ready
Hooks.on("ready", async function() {


    //migration script
    if(game.user.isGM) torgMigration()



    sheetResize();

    //modifying explosion methode for dices
    Die.prototype.explode = explode;

    //adding gmScreen to UI
    ui.GMScreen = new GMScreen();


    //-----applying GM possibilities pool if absent
    if (game.user.isGM && !game.user.getFlag('torgeternity', 'GMpossibilities')) {
        game.user.setFlag('torgeternity', 'GMpossibilities', 0)
    }

    //----load template for welcome message depending on supported languages
    let lang = game.settings.get("core", "language");
    torgeternity.supportedLanguages.indexOf(lang) == -1 ? lang = "en" : lang = lang;

    torgeternity.welcomeMessage = await renderTemplate(`systems/torgeternity/templates/welcomeMessage/${lang}.hbs`);

    //----rendering welcome message
    if (game.settings.get("torgeternity", "welcomeMessage") == true) {
        let d = new Dialog({
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

    //------Ask about hiding nonlocal compendium
    if (game.settings.get("torgeternity", "welcomeMessage") == true && !game.settings.get("torgeternity", "hideForeignCompendium")) {
        let d = new Dialog({
            title: game.i18n.localize("torgeternity.dialogWindow.hideForeignCompendium.title"),
            content: game.i18n.localize("torgeternity.dialogWindow.hideForeignCompendium.content"),
            buttons: {
                one: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: game.i18n.localize("torgeternity.yesNo.true"),
                    callback: async() => {
                        await game.settings.set("torgeternity", "hideForeignCompendium", true);
                        window.location.reload();
                    }

                },
                two: {
                    icon: '<i class="fas fa-ban"></i>',
                    label: game.i18n.localize("torgeternity.yesNo.false"),
                }
            }
        }, {
            top: 860,
            left: 100

        });
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
        setUpCardPiles();
    }

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
        title: game.i18n.localize('torgeternity.dialogWindow.externalLinks.title'),
        content: game.i18n.localize('torgeternity.dialogWindow.externalLinks.content'),
        buttons: {

            one: {
                icon: '<i class="fas fa-expand-arrows-alt"style="font-size:24px"></i>',
                label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.reference'),
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
                label: "<p>Discord</p>",
                callback: () => {
                    ui.notifications.info(game.i18n.localize('torgeternity.notifications.openDiscord'));
                    var windowObjectReference = window.open("https://discord.gg/foundryvtt", "_blank");

                }
            },


            three: {
                icon: '<i class="fas fa-bug" style="font-size:24px"></i>',
                label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.bug'),
                callback: () => {
                    ui.notifications.info(game.i18n.localize('torgeternity.notifications.openIssue'));
                    var windowObjectReference = window.open("https://github.com/gmmatt/torgeternity/issues/new", "_blank");

                }
            },
            four: {
                icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
                label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.publisher'),
                callback: () => {
                    ui.notifications.info(game.i18n.localize('torgeternity.notifications.openUlisses'));
                    var windowObjectReference = window.open("https://ulisses-us.com", "_blank");

                }
            }

        }
    };
    let dialOption = {
        width: 'auto',
        height: 250,
        left: 100,
        top: 20
    };
    //adding french links (shamelessly)
    if (game.settings.get("core", "language") == "fr") {
        dialData.buttons.five = {
            icon: '<img src="systems/torgeternity/images/BBE_logo.webp" alt="logo BBE" style="filter:grayscale(1);max-height:3em">',
            label: "<p>Distr. français</p>",
            callback: () => {
                ui.notifications.info("votre navigateur va ouvrir le site de BlackBook Editions dans un nouvel onglet  ");
                var windowObjectReference = window.open("https://www.black-book-editions.fr/catalogue.php?id=668", "_blank");

            }
        }
    }
    let externalLinks = new Dialog(dialData, dialOption)
        //----logo image
    var logo = document.getElementById("logo");
    logo.style.position = "absolute";
    logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.webp");
    //----open links when click on logo
    logo.title = "external links"
    logo.addEventListener("click", function() {
        externalLinks.render(true)
    })





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


//moved out of the setup hook, because it had no need to be in there
Hooks.on("hotbarDrop", (bar, data, slot) =>
    createTorgEternityMacro(data, slot)
);

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on("getMonarchHandComponents", (hand, components) => {
    components.markers.push({
        tooltip: `${game.i18n.localize("torgeternity.poolToggle.inPool")}`,
        class: "pool-marker",
        icon: "fas fa-tags",
        color: "#FFFFFF",
        show: (card) => card.getFlag("torgeternity", "pooled")
    });
    components.controls.push({
        tooltip: `${game.i18n.localize("torgeternity.monarch.discard")}`,
        class: "discard-button",
        icon: "fas fa-inbox",
        color: "#FFFFFF",
        onclick: (event, card) => {
            card.setFlag("torgeternity", "pooled", false);
            if (card.data.type == "destiny") {
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
            } else {
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").cosmDiscard));
            }
            card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.chatText.discardsCard")} ${card.name}</span></div>` });
        }
    });
    components.controls.push({
        tooltip: `${game.i18n.localize("torgeternity.monarch.broadcast")}`,
        class: "broadcast-button",
        icon: "fas fa-broadcast-tower",
        color: "#FFFFFF",
        onclick: (event, card) => {
            let x = new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
            x.shareImage();
        }
    });
    components.controls.push({
        tooltip: `${game.i18n.localize("torgeternity.monarch.play")}`,
        class: "play-button",
        icon: "fas fa-play",
        color: "#FFFFFF",
        onclick: (event, card) => {
            card.setFlag("torgeternity", "pooled", false);
            if (card.data.type == "destiny") {
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
            } else {
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").cosmDiscard));
            }
            card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.chatText.playsCard")} ${card.name}</span></div>` })
        }
    });
    components.controls.push({
        class: "pool-toggle",
        tooltip: `${game.i18n.localize("torgeternity.poolToggle.toogle")}`,
        icon: "fas fa-tags",
        color: "#FFFFFF",
        onclick: (event, card) => card.setFlag("torgeternity", "pooled", !card.getFlag("torgeternity", "pooled"))
    });
});

async function createTorgEternityMacro(data, slot) {
    if (data.type !== "Item" && data.type !== "skill" && data.type !== "interaction" && data.type !== "attribute") return;
    if (!("data" in data))
        return ui.notifications.warn(
            game.i18n.localize('torgeternity.notifications.macroTypeWarning')
        );
    const objData = data.data;
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
    } else // attribute, skill, interaction
    {
        const internalSkillName = objData.name;
        const internalAttributeName = objData.attribute;
        const isAttributeTest = (internalSkillName === internalAttributeName);
        const isInteractionAttack = (data.type === "interaction");

        command = `game.torgeternity.rollSkillMacro("${internalSkillName}", "${internalAttributeName}", ${isInteractionAttack});`;

        const displaySkillName = isAttributeTest ? null : game.i18n.localize("torgeternity.skills." + internalSkillName);
        const displayAttributeName = game.i18n.localize("torgeternity.attributes." + internalAttributeName);

        if (data.type === "skill")
            macroName = displaySkillName + "/" + displayAttributeName;
        else if (data.type === "attribute")
            macroName = displayAttributeName;
        else if (data.type === "interaction")
            macroName = displaySkillName;
        macroFlag = "skillMacro";

        if (data.type === "attribute") {
            // this is an attribute test
            // use built-in foundry icons
            if (internalAttributeName === "charisma")
                macroImg = "icons/skills/social/diplomacy-handshake.webp";
            else if (internalAttributeName === "dexterity")
                macroImg = "icons/skills/movement/feet-winged-boots-brown.webp";
            else if (internalAttributeName === "mind")
                macroImg = "icons/sundries/books/book-stack.webp";
            else if (internalAttributeName === "spirit")
                macroImg = "icons/magic/life/heart-shadow-red.webp";
            else if (internalAttributeName === "strength")
                macroImg = "icons/magic/control/buff-strength-muscle-damage.webp";
        } else {
            // not attribute test
            // don't have skill icons yet
            // macroImg = "systems/torgeternity/images/icons/skill-" + internalSkillName + "-icon.png";
        }
    }

    macro = game.macros.find(
        (m) => m.name === macroName && m.data.command === command
    );
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
                        [macroFlag]: true
                    }
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
                        [macroFlag]: true
                    }
                },
            });
        }
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
            game.i18n.localize('torgeternity.notifications.noItemNamed') + item.name
        );

    // Trigger the item roll
    switch (item.data.type) {
        case "customAttack":
        case "meleeweapon":
        case "missileweapon":
        case "firearm":
        case "energyweapon":
        case "heavyweapon":
            // The following is copied/pasted/adjusted from _onAttackRoll in torgeternityActorSheet
            var weaponData = item.data.data;
            var attackWith = weaponData.attackWith;
            var skillData = actor.data.data.skills[weaponData.attackWith];
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
            var attributes = actor.data.data.attributes;
            var attackType = weaponData.damageType;

            // Modify dnDecriptor if target exists
            if (Array.from(game.user.targets).length > 0) {
            
                switch (attackWith) {
                    case "fireCombat":
                    case "energyWeapons":
                    case "heavyWeapons":
                    case "missileWeapons":
                        dnDescriptor = "targetDodge";
                        break;
                    default:
                        dnDescriptor = "targetMeleeWeapons"
                }
            } else {
                dnDescriptor = "standard"
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
                    adjustedDamage = parseInt(weaponDamage)
            }
                    
            var mTest = {

                testType: "attack",
                type: "attack",
                actor: actor,
                actorType: actor.data.type,
                item: item,
                attackType: attackType,
                isAttack: true,
                actorPic: actor.data.img,
                skillName: weaponData.attackWith,
                skillBaseAttribute: skillData.baseAttribute,
                skillValue: skillData.value,
                skillAdds: skillData.adds,
                unskilledUse: true,
                rollTotal: 0,
                DNDescriptor: dnDescriptor,
                weaponName: item.data.name,
                weaponDamageType: weaponData.damageType,
                weaponDamage: weaponData.damage,
                damage: adjustedDamage,
                weaponAP: weaponData.ap,
                applyArmor: true,
                targets: Array.from(game.user.targets),
                applySize: true,
                attackOptions: true,
                darknessModifier: 0,
                chatNote: weaponData.chatNote
            }

            let dialog = new testDialog(mTest);
            dialog.render(true);
            break;
        case "psionicpower":
        case "miracle":
        case "spell":
            /* This part is not functional, kept for test purpose, replaced by the following "log" and "ui.notification"
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
            */
            console.log("Same action for Psi/Miracles/Spells");
            ui.notifications.info(game.i18n.localize('torgeternity.notifications.notImplemented'));
            break;
        default:
            ui.notifications.info(game.i18n.localize('torgeternity.notifications.defaultAction'));
            return item.roll({ async: false });
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
    const isAttributeTest = (skillName === attributeName);
    let skill = null;
    if (!isAttributeTest) {
        const skillNameKey = skillName; // skillName required to be internal value
        // would be nice to use display value as an input instead but we can't translate from i18n to internal values
        skill = actor && Object.keys(actor.data.data.skills).includes(skillNameKey) ? actor.data.data.skills[skillNameKey] : null;
        if (!skill)
            return ui.notifications.warn(
                game.i18n.localize('torgeternity.notifications.noSkillNamed') + skillName
            );
    }

    const attributeNameKey = attributeName.toLowerCase();
    const attribute = actor && Object.keys(actor.data.data.attributes).includes(attributeNameKey) ? actor.data.data.attributes[attributeNameKey] : null;
    if (!attribute)
        return ui.notifications.warn(
            game.i18n.localize('torgeternity.notifications.noItemNamed')
        );
    if (isAttributeTest) {
        // dummy skill object since there's no actual skill in this case
        skill = {
            baseAttribute: attributeName,
            adds: 0,
            value: attribute,
            isFav: false,
            groupName: "other",
            unskilledUse: 1
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
            const otherAttribute = actor.data.data.attributes[skill.baseAttribute];
            skillValue = skill.value - otherAttribute + attribute;
        }
    }
    // Trigger the skill roll
    // The following is copied/pasted/adjusted from _onSkillRoll and _onInteractionAttack in torgeternityActorSheet
    // This code needs to be centrally located!!!
    let test = {
        testType: isAttributeTest ? "attribute" : "skill",
        actor: actor,
        actorPic: actor.data.img,
        actorType: actor.data.type,
        skillName: isAttributeTest ? attributeName : skillName,
        skillBaseAttribute: game.i18n.localize("torgeternity.attributes." + attributeName),
        skillAdds: skill.adds,
        skillValue: skillValue,
        isAttack: false,
        targets: Array.from(game.user.targets),
        applySize: false,
        DNDescriptor: "standard",
        attackOptions: false,
        rollTotal: 0,
        unskilledUse: skill.unskilledUse,
        woundModifier: parseInt(-(actor.data.data.wounds.value)),
        stymiedModifier: parseInt(actor.data.data.stymiedModifier),
        darknessModifier: 0, //parseInt(actor.data.data.darknessModifier),
        type: "skill"
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
                    dnDescriptor = "standard"
            }
        } else {
            dnDescriptor = "standard"
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
})

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
    if (game.settings.get("torgeternity", "hideForeignCompendium") == true) {
        hideCompendium(game.settings.get("core", "language"), html)

    }
})


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

Hooks.on('updateActor', (actor, change, options, userId) => {
    //updating playerList with users character up-to-date data
    ui.players.render(true);
    
    if(actor.type === "stormknight"){
        let hand = actor.getDefaultHand()
        //If there is no hand for that SK, and a GM is online, create one
        if(!hand && game.userId === game.users.find(u=>u.isGM && u.active).id){
            actor.createDefaultHand()
        }
        //If the update includes permissions, sync them to the hand
        if(hand && change.ownership && game.userId === userId){
            //DO NOT PUT ANYTHING ELSE IN THIS UPDATE! diff:false, recursive:false can easily nuke stuff
            hand.update({ownership: actor.getHandOwnership()},{diff:false, recursive: false})
        }
    }
});

// by default creating a  hand for each stormknight
Hooks.on("createActor", async(actor, options, userId) => {
    //run by first active GM. Will be skipped if no GM is present, but that's the best we can do at the moment
    if (actor.type === "stormknight" && game.userId === game.users.find(u=>u.isGM && u.active).id) { 
        actor.createDefaultHand()
    }

})