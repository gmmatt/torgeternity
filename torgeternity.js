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
import {attackDialog} from "/systems/torgeternity/module/attack-dialog.js";//Added


Hooks.once("init", async function() {
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
    DocumentSheetConfig.registerSheet(Card, "core", torgeternityCardConfig, {label: "Torg Eternity Card Configuration", types: ["destiny", "drama", "cosm"], makeDefault: true})
    

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

    //------Ask about hiding nonlocal compendium
    if (game.i18n.lang === "en" && game.settings.get("torgeternity", "welcomeMessage") == true) {
        let d = new Dialog ({
            title: "Hide German Compendiums?",
            content: "This system includes both English and German language compendiums. Do you want to hide the German compendiums?",
            buttons: {
                one: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Yes",
                    callback: () =>
                        game.settings.set("torgeternity", "hideGerman", true)
                },
                two: {
                    icon: '<i class="fas fa-ban"></i>',
                    label: "No",
                }
            }
        });
        d.render(true);
    } else if (game.i18n.lang === "de" && game.settings.get("torgeternity", "welcomeMessage") == true) {
        let d = new Dialog ({
            title: "Hide English Compendiums?",
            content: "This system includes both English and German language compendiums. Do you want to hide the English compendiums?",
            buttons: {
                one: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: "Yes",
                    callback: () =>
                        game.settings.set("torgeternity", "hideEnglish", true)
                },
                two: {
                    icon: '<i class="fas fa-ban"></i>',
                    label: "No",
                }
            }
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
            game.cards.importFromCompendium(pack,itemId)
        }
        // Add Drama Deck
        if (game.cards.getName("Drama Deck") ==  null) {
            const itemId = pack.index.getName("Drama Deck")._id;
            game.cards.importFromCompendium(pack,itemId)
        }
        // Add Cosm Discard
        if (game.cards.getName("Cosm Discard") == null) {
            let cardData = {
                name: "Cosm Discard",
                type: "pile",
                permission: {default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER}
            }
            let cosmDiscard = Cards.create(cardData, {keepId: true, renderSheet:false});
        }
        // Add Drama Discard
        if (game.cards.getName("Drama Discard") == null) {
            let cardData = {
                name: "Drama Discard",
                type: "pile",
                permission: {default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER}
            }
            let dramaDiscard = Cards.create(cardData, {keepId: true, renderSheet:false});
        }
        // Add Destiny Discard
        if (game.cards.getName("Destiny Discard") == null) {
            let cardData = {
                name: "Destiny Discard",
                type: "pile",
                permission: {default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER}
            }
            let destinyDiscard = Cards.create(cardData, {keepId: true, renderSheet:false});
        }
        // Add Active Drama
        if (game.cards.getName("Active Drama Card") == null) {
            let cardData = {
                name: "Active Drama Card",
                type: "pile"
            }
            let activeDrama = Cards.create(cardData, {keepId: true, renderSheet:false});
        }

        // Add journal entry with instructions relating to cards
        if (game.journal.getName("Managing Cards") == null) {
            const itemId = basicRules.index.getName("Managing Cards")._id;
            game.journal.importFromCompendium(basicRules,itemId);
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
    let externalLinks = new Dialog({
        title: "Links",
        content: "<p>Need help? Want to report a bug? Here are a few usefull links.</p>",
        buttons: {

            one: {
                icon: '<i class="fas fa-expand-arrows-alt"style="font-size:24px"></i>',
                label: "<p>Reference</p>",
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
                label: "<p>Bug?</p>",
                callback: () => {
                    ui.notifications.info("your browser will open a new page to complete an issue");
                    var windowObjectReference = window.open("https://github.com/gmmatt/torgeternity/issues/new", "_blank");

                }
            },
            four: {
                icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
                label: "<p>Publisher</p>",
                callback: () => {
                    ui.notifications.info("your browser will open a new page to complete an issue");
                    var windowObjectReference = window.open("https://ulisses-us.com", "_blank");

                }
            }

        }
    }, {
        width: 400,
        height: 250,
        left: 100,
        top: 20
    });
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
        class: "pool-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerPool")}`,
        icon: "fas fa-arrow-circle-up",
        color: "#ff9900",
        show: (card) => card.getFlag("torgeternity", "pooled")
    },
	{
        class: "destiny-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerDestiny")}`,
        icon: "fas fa-tags",
        color: "#0099ff",
        show: (card) => card.getFlag("torgeternity", "destiny")
    },
	{
        class: "drama-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerDrama")}`,
        icon: "fas fa-tags",
        color: "#993366",
        show: (card) => card.getFlag("torgeternity", "drama")
    });
    components.controls.push({
        class: "pool-toggle",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.tooglePool")}`,
        icon: "fas fa-arrow-circle-up",
        color: "#ff9900",
        onclick: (event, card) => card.setFlag("torgeternity", "pooled", !card.getFlag("torgeternity", "pooled"))
    });
	if (game?.user?.isGM) {
		components.controls.push({
			class: "destiny-toggle",
			tooltip: `${game.i18n.localize("torgeternity.monarchToggles.toogleDestiny")}`,
			icon: "fas fa-tags",
			color: "#0099ff",
			onclick: (event, card) => card.setFlag("torgeternity", "destiny", !card.getFlag("torgeternity", "destiny"))
		},
		{
			class: "drama-toggle",
			tooltip: `${game.i18n.localize("torgeternity.monarchToggles.toogleDrama")}`,
			icon: "fas fa-tags",
			color: "#993366",
			onclick: (event, card) => card.setFlag("torgeternity", "drama", !card.getFlag("torgeternity", "drama"))
		});		
	}
});

Hooks.on("getMonarchDeckComponents", (hand, components) => {
    components.markers.push({
        class: "pool-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerPool")}`,
        icon: "fas fa-arrow-circle-up",
        color: "#ff9900",
        show: (card) => card.getFlag("torgeternity", "pooled")
    },
		{
        class: "destiny-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerDestiny")}`,
        icon: "fas fa-tags",
        color: "#0099ff",
        show: (card) => card.getFlag("torgeternity", "destiny")
    },
		{
        class: "drama-marker",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.markerDrama")}`,
        icon: "fas fa-tags",
        color: "#993366",
        show: (card) => card.getFlag("torgeternity", "drama")
    });
    components.controls.push({
        class: "destiny-toggle",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.toogleDestiny")}`,
        icon: "fas fa-tags",
        color: "#0099ff",
        onclick: (event, card) => card.setFlag("torgeternity", "destiny", !card.getFlag("torgeternity", "destiny"))
    },
	{
        class: "drama-toggle",
        tooltip: `${game.i18n.localize("torgeternity.monarchToggles.toogleDrama")}`,
        icon: "fas fa-tags",
        color: "#993366",
        onclick: (event, card) => card.setFlag("torgeternity", "drama", !card.getFlag("torgeternity", "drama"))
    });
});

async function createTorgEternityMacro(data, slot) {
    if (data.type !== "Item") return;
    if (!("data" in data))
        return ui.notifications.warn(
            "You can only create macro buttons for owned Items"
        );
    const itemData = data.data;
    // Create the macro command
    const command = `game.torgeternity.rollItemMacro("${itemData.name}");`;
    let macro = game.macros.find(
        (m) => m.name === itemData.name && m.data.command === command
    )
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
                            message: "Cannot attempt enhanced attack test without a target. Select a target and try again.",
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
            return item.roll();
    }
}

Hooks.on("renderCombatTracker", (combatTracker) => {
    const hands = game.cards;
    for (let hand of hands) {
        hand.apps[combatTracker.id] = combatTracker;
    }
})

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
    if (game.settings.get("torgeternity", "hideGerman") == true) {
        game.packs.delete("torgeternity.system-de-archetypen");
        html.find('li[data-pack="torgeternity.system-de-archetypen"]').hide();

        game.packs.delete("torgeternity.system-de-basisregeln");
        html.find('li[data-pack="torgeternity.system-de-basisregeln"]').hide();

        game.packs.delete("torgeternity.system-de-grundkarten");
        html.find('li[data-pack="torgeternity.system-de-grundkarten"]').hide()
    }

    if (game.settings.get("torgeternity", "hideEnglish") == true) {
        game.packs.delete("torgeternity.archetypes");
        html.find('li[data-pack="torgeternity.archetypes"]').hide();

        game.packs.delete("torgeternity.basic-rules");
        html.find('li[data-pack="torgeternity.basic-rules"]').hide();

        game.packs.delete("torgeternity.core-card-set");
        html.find('li[data-pack="torgeternity.core-card-set"]').hide();
        
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
