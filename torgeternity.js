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
import torgCombatant from "./module/dramaticScene/torgeternityCombatant.js";
import { registerDiceSoNice } from "./module/dice-so-nice.js";
import torgeternityPlayerHand from "./module/cards/torgeternityPlayerHand.js";
import torgeternityPile from "./module/cards/torgeternityPile.js";
import torgeternityDeck from "./module/cards/torgeternityDeck.js";
import torgeternityCardConfig from "./module/cards/torgeternityCardConfig.js";
import { torgeternityCards } from "./module/cards/torgeternityCards.js";
import { attackDialog } from "/systems/torgeternity/module/attack-dialog.js"; //Added
import { skillDialog } from "/systems/torgeternity/module/skill-dialog.js";
import { interactionDialog } from "/systems/torgeternity/module/interaction-dialog.js";
import { hideCompendium } from './module/hideCompendium.js';

Hooks.once("init", async function() {
    console.log("torgeternity | Initializing Torg Eternity System");
    CONFIG.debug.hooks = true;
    //----helpers
    registerHelpers();

    //-----system settings
    registerTorgSettings()

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
    CONFIG.Scene.sheetClass = torgeternitySceneConfig;
    CONFIG.ui.nav = torgeternityNav;

    //---custom user class
    CONFIG.ui.players = TorgeternityPlayerList;

    //---cards
    CONFIG.Cards.documentClass = torgeternityCards;
    CONFIG.cardTypes = torgeternity.cardTypes;

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

Hooks.once("setup", async function() {
        modifyTokenBars();
        //changing stutus marker 
        //preparing status marker

        if (game.settings.get("core", "language") === "fr") {
            for (let effect of CONFIG.statusEffects) {
                effect.icon = effect.icon.replace("systems/torgeternity/images/status-markers", "systems/torgeternity/images/status-markers/fr")
            }
        }

    }),

    Hooks.once("diceSoNiceReady", (dice3d) => {
        registerDiceSoNice(dice3d);
    });

//-------------once everything ready
Hooks.on("ready", async function() {
    sheetResize();
    //toggleViewMode();


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


    //----setup cards if needed

    if (game.settings.get("torgeternity", "setUpCards") === true) {
        const pack = game.packs.get("torgeternity.core-card-set");
        const basicRules = game.packs.get("torgeternity.basic-rules")
            // Add Destiny Deck
        if (game.cards.getName("Destiny Deck") == null) {
            const itemId = pack.index.getName("Destiny Deck")._id;
            game.cards.importFromCompendium(pack, itemId)
        }
        // Add Drama Deck
        if (game.cards.getName("Drama Deck") == null) {
            const itemId = pack.index.getName("Drama Deck")._id;
            game.cards.importFromCompendium(pack, itemId)
        }
        // Add Cosm Discard
        if (game.cards.getName("Cosm Discard") == null) {
            let cardData = {
                name: "Cosm Discard",
                type: "pile",
                permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
            }
            let cosmDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        }
        // Add Drama Discard
        if (game.cards.getName("Drama Discard") == null) {
            let cardData = {
                name: "Drama Discard",
                type: "pile",
                permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
            }
            let dramaDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        }
        // Add Destiny Discard
        if (game.cards.getName("Destiny Discard") == null) {
            let cardData = {
                name: "Destiny Discard",
                type: "pile",
                permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
            }
            let destinyDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        }
        // Add Active Drama
        if (game.cards.getName("Active Drama Card") == null) {
            let cardData = {
                name: "Active Drama Card",
                type: "pile"
            }
            let activeDrama = Cards.create(cardData, { keepId: true, renderSheet: false });
        }

        // Add journal entry with instructions relating to cards
        if (game.journal.getName("Managing Cards") == null) {
            const itemId = basicRules.index.getName("Managing Cards")._id;
            game.journal.importFromCompendium(basicRules, itemId);
        }

        game.settings.set("torgeternity", "setUpCards", false)
    }


    //----pause image----
    Hooks.on("renderPause", () => {

        let path = game.settings.get("torgeternity", "pauseMedia");
        let img = document.getElementById("pause").firstElementChild;
        path = "./" + path;
        img.style.content = `url(${path})`
    })

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
                    ui.notifications.info("Your browser will open a new page to join us on our discord server");
                    var windowObjectReference = window.open("https://discord.gg/foundryvtt", "_blank");

                }
            },


            three: {
                icon: '<i class="fas fa-bug" style="font-size:24px"></i>',
                label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.bug'),
                callback: () => {
                    ui.notifications.info("your browser will open a new page to complete an issue");
                    var windowObjectReference = window.open("https://github.com/gmmatt/torgeternity/issues/new", "_blank");

                }
            },
            four: {
                icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
                label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.publisher'),
                callback: () => {
                    ui.notifications.info("your browser will open a new page to complete an issue");
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
                ui.notifications.info("your browser will open a new page to complete an issue");
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
                card.pass(game.cards.getName("Destiny Discard"));
            } else {
                card.pass(game.cards.getName("Cosm Discard"));
            }
            card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.dialogPrompts.discards")} ${card.name}</span></div>` });
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
                card.pass(game.cards.getName("Destiny Discard"));
            } else {
                card.pass(game.cards.getName("Cosm Discard"));
            }
            card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.dialogPrompts.plays")} ${card.name}</span></div>` })
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
            "You can only create macro buttons for owned Items and Attributes/Skills"
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
        macroFlag = "torgeternity.itemMacro";
    } else // attribute, skill, interaction
    {
        const capitalizedSkillName = capitalizeText(objData.name);
        const capitalizedAttributeName = capitalizeText(objData.attribute);
        let isInteractionAttack = (data.type === "interaction");
        command = `game.torgeternity.rollSkillMacro("${capitalizedSkillName}", "${capitalizedAttributeName}", ${isInteractionAttack});`;

        if (data.type === "skill")
            macroName = capitalizedSkillName + "/" + capitalizedAttributeName;
        else if (data.type === "attribute")
            macroName = capitalizedAttributeName;
        else if (data.type === "interaction")
            macroName = capitalizedSkillName;
        macroImg = "systems/torgeternity/images/icons/explosion-icon.jpg"; // need skill icons!
        /*
            I would add more skill groupNames for icon-selecting purposes. Right now
            there is "combat" and "interaction." There is room for "miracle," 
            "psionicpower," and "spell" (using the icons for those power types). And 
            then I think you can maybe break up the remaining skills into broad 
            categories: "vehicle," "investigation," "outdoors?," "social," "smarts," 
            etc. that can each have their own icon.
            
            OR, there could be one icon for each attribute, which can be used for 
            attribute tests and for any skill using that attribute, maybe with a 
            slightly modified version for the skills so there's a visual difference.
         */
        macroFlag = "torgeternity.skillMacro";
    }

    macro = game.macros.find(
        (m) => m.name === macroName && m.data.command === command
    );
    if (!macro) {
        macro = await Macro.create({
            name: macroName,
            type: "script",
            img: macroImg,
            command: command,
            flags: { macroFlag: true },
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
            var targetDefenseSkill = "Dodge";
            console.log(targetDefenseSkill);
            var targetDefenseValue = 0;

            // Exit if no target or get target data
            if (Array.from(game.user.targets).length === 0) {
                var needTargetData = {
                    user: game.user.data._id,
                    speaker: ChatMessage.getSpeaker(),
                    owner: actor,
                };

                var templateData = {
                    message: game.i18n.localize('torgeternity.chatText.check.needTarget'),
                    actorPic: actor.data.img
                };

                const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

                templatePromise.then(content => {
                    needTargetData.content = content;
                    ChatMessage.create(needTargetData);
                })

                return;
            } else {
                var target = Array.from(game.user.targets)[0];
                var targetType = target.actor.data.type;
                if (target.actor.data.data.details.sizeBonus === "tiny") {
                    sizeModifier = -6;
                } else if (target.actor.data.data.details.sizeBonus === "verySmall") {
                    sizeModifier = -4;
                } else if (target.actor.data.data.details.sizeBonus === "small") {
                    sizeModifier = -2;
                } else if (target.actor.data.data.details.sizeBonus === "large") {
                    sizeModifier = 2;
                } else if (target.actor.data.data.details.sizeBonus === "veryLarge") {
                    sizeModifier = 4;
                } else {
                    sizeModifier = 0;
                }
                vulnerableModifier = target.actor.data.data.vulnerableModifier;
                targetToughness = target.actor.data.data.other.toughness;
                targetArmor = target.actor.data.data.other.armor;
                if (attackWith === "fireCombat" || attackWith === "energyWeapons" || attackWith === "heavyWeapons" || attackWith === "missileWeapons") {
                    targetDefenseSkill = "Dodge";
                    console.log(targetDefenseSkill);
                    if (targetType === "threat") {
                        targetDefenseValue = target.actor.data.data.skills.dodge.value;
                    } else {
                        targetDefenseValue = target.actor.data.data.dodgeDefense;
                    }
                } else {
                    if (target.actor.data.data.skills.meleeWeapons.adds > 0 || (targetType === "threat" && target.actor.data.data.skills.meleeWeapons.value > 0)) {
                        targetDefenseSkill = "Melee Weapons";
                        console.log(targetDefenseSkill);
                        if (targetType === "threat") {
                            targetDefenseValue = target.actor.data.data.skills.meleeWeapons.value;
                        } else {
                            targetDefenseValue = target.actor.data.data.meleeWeaponsDefense;
                        }
                    } else {
                        targetDefenseSkill = "Unarmed Combat";
                        console.log(targetDefenseSkill);
                        if (targetType === "threat") {
                            targetDefenseValue = target.actor.data.data.skills.unarmedCombat.value;
                        } else {
                            targetDefenseValue = target.actor.data.data.unarmedCombatDefense;
                        }
                    }
                }
            };

            var mTest = {

                testType: "attack",
                actor: actor,
                actorType: actor.data.type,
                item: item,
                actorPic: actor.data.img,
                skillName: weaponData.attackWith,
                skillBaseAttribute: skillData.baseAttribute,
                skillValue: skillData.value,
                unskilledUse: skillData.unskilledUse,
                strengthValue: actor.data.data.attributes.strength,
                charismaValue: actor.data.data.attributes.charisma,
                dexterityValue: actor.data.data.attributes.dexterity,
                mindValue: actor.data.data.attributes.mind,
                spiritValue: actor.data.data.attributes.spirit,
                possibilityTotal: 0,
                upTotal: 0,
                heroTotal: 0,
                dramaTotal: 0,
                cardsPlayed: 0,
                weaponName: item.data.name,
                weaponDamageType: weaponData.damageType,
                weaponDamage: weaponData.damage,
                damage: weaponData.damage,
                weaponAP: weaponData.ap,
                targetToughness: targetToughness,
                targetArmor: targetArmor,
                targetDefenseSkill: targetDefenseSkill,
                targetDefenseValue: targetDefenseValue,
                targetType: targetType,
                woundModifier: parseInt(-(actor.data.data.wounds.value)),
                stymiedModifier: parseInt(actor.data.data.stymiedModifier),
                darknessModifier: parseInt(actor.data.data.darknessModifier),
                sizeModifier: sizeModifier,
                vulnerableModifier: vulnerableModifier,
                vitalAreaDamageModifier: 0,
                chatNote: weaponData.chatNote

            }

            let testDialog = new attackDialog(mTest);
            testDialog.render(true);
            // End of copied/pasted/adjusted, choosed to open the Dialog (as with shift event), drawback NEED a Target
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
            ui.notifications.info("Not Handled at this moment");
            break;
        default:
            ui.notifications.info("Default action, Gear for example");
            return item.roll({ async: false });
    }
}

function capitalizeText(text) {
    return text.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
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
    let isAttributeTest = (skillName === attributeName);
    let skill = null;
    if (!isAttributeTest) {
        const skillNameKey = skillName.toLowerCase();
        skill = actor && Object.keys(actor.data.data.skills).includes(skillNameKey) ? actor.data.data.skills[skillNameKey] : null;
        if (!skill)
            return ui.notifications.warn(
                `Your controlled Actor does not have a skill named ${skillName}`
            );
    }

    const attributeNameKey = attributeName.toLowerCase();
    const attribute = actor && Object.keys(actor.data.data.attributes).includes(attributeNameKey) ? actor.data.data.attributes[attributeNameKey] : null;
    if (!attribute)
        return ui.notifications.warn(
            `Your controlled Actor does not have an attribute named ${attributeName}`
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
        testType: "skill",
        actor: actor,
        actorPic: actor.data.img,
        actorType: actor.data.type,
        skillName: skillName,
        skillBaseAttribute: attributeName,
        skillAdds: skill.adds,
        skillValue: skillValue,
        unskilledUse: skill.unskilledUse,
        woundModifier: parseInt(-(actor.data.data.wounds.value)),
        stymiedModifier: parseInt(actor.data.data.stymiedModifier),
        darknessModifier: 0, //parseInt(actor.data.data.darknessModifier),
        type: "skill",
        possibilityTotal: 0,
        upTotal: 0,
        heroTotal: 0,
        dramaTotal: 0,
        cardsPlayed: 0,
        sizeModifier: 0,
        vulnerableModifier: 0
    };
    if (isInteractionAttack) {
        test["type"] = "interactionAttack";
        test["testType"] = "interactionAttack";
        test["interactionAttackType"] = skillName.toLowerCase();
        test["darknessModifier"] = 0;
        // Darkness seems like it would be hard to determine if it should apply to 
        //    skill/attribute tests or not, maybe should be option in dialog?

        // Exit if no target or get target data
        if (Array.from(game.user.targets).length === 0) {
            var needTargetData = {
                user: game.user.data._id,
                speaker: ChatMessage.getSpeaker(),
                owner: actor
            };

            var templateData = {
                message: game.i18n.localize("torgeternity.chatText.check.cantAttemptInteraction"),
                actorPic: actor.data.img
            };

            const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

            templatePromise.then(content => {
                needTargetData.content = content;
                ChatMessage.create(needTargetData);
            })

            return;
        } else {
            var target = Array.from(game.user.targets)[0];
            var targetType = target.actor.data.type;
            test.vulnerableModifier = target.actor.data.data.vulnerableModifier;
            if (test.interactionAttackType === "intimidation") {
                if (target.actor.data.data.skills.intimidation.value > 0) {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.intimidation");
                    test.targetDefenseValue = target.actor.data.data.skills.intimidation.value;
                } else {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.attributes.spirit");
                    test.targetDefenseValue = target.actor.data.data.attributes.spirit;
                }
            } else if (test.interactionAttackType === "maneuver") {
                if (target.actor.data.data.skills.maneuver.value > 0) {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.maneuver");
                    test.targetDefenseValue = target.actor.data.data.skills.maneuver.value;
                } else {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.attributes.dexterity");
                    test.targetDefenseValue = target.actor.data.data.attributes.dexterity;
                }
            } else if (test.interactionAttackType === "taunt") {
                if (target.actor.data.data.skills.taunt.value > 0) {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.taunt");
                    test.targetDefenseValue = target.actor.data.data.skills.taunt.value;
                } else {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.attributes.charisma");
                    test.targetDefenseValue = target.actor.data.data.attributes.charisma;
                }
            } else if (test.interactionAttackType === "trick") {
                if (target.actor.data.data.skills.trick.value > 0) {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.skills.trick");
                    test.targetDefenseValue = target.actor.data.data.skills.trick.value;
                } else {
                    test.targetDefenseSkill = game.i18n.localize("torgeternity.attributes.mind");
                    test.targetDefenseValue = target.actor.data.data.attributes.mind;
                }
            }
        }
    }
    if (actor.data.data.stymiedModifier === parseInt(-2)) {
        test.stymiedModifier = -2;
    } else if (actor.data.data.stymiedModifier === -4) {
        test.stymiedModifier = -4;
    }

    if (isInteractionAttack) {
        let testDialog = new interactionDialog(test);
        testDialog.render(true);
    } else if (event.shiftKey) {
        let testDialog = new skillDialog(test);
        testDialog.render(true);
    } else {
        torgchecks.SkillCheck(test);
    }
}

Hooks.on("renderCombatTracker", (combatTracker) => {
    const hands = game.cards;
    for (let hand of hands) {
        hand.apps[combatTracker.id] = combatTracker;
    }
})

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
    console.log('----------directory compendium')
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

Hooks.on('updateActor', (actor, data, options, id) => {
    //updating playerList with users character up-to-date data
    ui.players.render(true);
})