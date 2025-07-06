'use strict';
import { torgeternity } from './config.js';
import TorgeternityChatLog from './torgeternityChatLog.js';
import TorgeternityItem from './documents/item/torgeternityItem.js';
import TorgeternityActor from './documents/actor/torgeternityActor.js';
import TorgeternityItemSheet from './sheets/torgeternityItemSheet.js';
import TorgeternityActorSheet from './sheets/torgeternityActorSheet.js';
import { sheetResize } from './sheetResize.js';
import { preloadTemplates } from './preloadTemplates.js';
import torgeternityCombat from './dramaticScene/torgeternityCombat.js';
import torgeternityCombatTracker from './dramaticScene/torgeternityCombatTracker.js';
// Disabling Player List extension until it can be updated for version 10
import TorgeternityPlayerList from './users/TorgeternityPlayerList.js';
import torgeternitySceneConfig from './torgeternitySceneConfig.js';
import torgeternityNav from './torgeternityNav.js';
import { registerTorgSettings } from './settings.js';
import * as torgChecks from './torgchecks.js';
import { modifyTokenBars } from './tokenBars.js';
import TorgCombatant from './dramaticScene/torgeternityCombatant.js';
import { registerDiceSoNice } from './dice-so-nice.js';
import torgeternityPlayerHand from './cards/torgeternityPlayerHand.js';
import torgeternityPile from './cards/torgeternityPile.js';
import torgeternityDeck from './cards/torgeternityDeck.js';
import torgeternityCardConfig from './cards/torgeternityCardConfig.js';
import { torgeternityCards } from './cards/torgeternityCards.js';
import { TestDialog } from './test-dialog.js';
import { hideCompendium } from './hideCompendium.js';
import initTorgControlButtons from './controlButtons.js';
import createTorgShortcuts from './keybinding.js';
import GMScreen from './GMScreen.js';
import { setUpCardPiles } from './cards/setUpCardPiles.js';
import { explode, reroll } from './explode.js';
import { activateStandartScene } from './activateStandartScene.js';
import { torgMigration } from './migrations.js';
import initTextEdidor from './initTextEditor.js';
import initProseMirrorEditor from './initProseMirrorEditor.js';
import { TorgeternityMacros } from './macros.js';
import { ChatMessageTorg } from './documents/chat/document.js';
import * as actorDataModels from './data/actor/index.js';
import * as itemDataModels from './data/item/index.js';
import * as cardDataModels from './data/card/index.js';
import TorgActiveEffect from './documents/active-effect/torgActiveEffect.js';
import MacroHub from './MacroHub.js';

const { DialogV2 } = foundry.applications.api;

Hooks.once('init', async function () {
  console.log('torgeternity | Initializing Torg Eternity System');

  // -------global
  game.torgeternity = {
    rollItemMacro,
    rollSkillMacro,
    viewMode: true,
    macros: new TorgeternityMacros(),
  };
  initTextEdidor();
  initProseMirrorEditor();
  CONFIG.torgeternity = torgeternity;
  CONFIG.Item.documentClass = TorgeternityItem;
  CONFIG.Actor.documentClass = TorgeternityActor;
  CONFIG.ActiveEffect.documentClass = TorgActiveEffect;
  CONFIG.Actor.dataModels = actorDataModels.config;
  CONFIG.Item.dataModels = itemDataModels.config;
  CONFIG.Card.dataModels = cardDataModels.config;
  CONFIG.statusEffects = torgeternity.statusEffects;
  CONFIG.attributeTypes = torgeternity.attributeTypes;

  // --------combats
  CONFIG.Combat.initiative.formula = '1';
  CONFIG.Combat.documentClass = torgeternityCombat;
  CONFIG.ui.combat = torgeternityCombatTracker;
  CONFIG.Combatant.documentClass = TorgCombatant;
  CONFIG.ChatMessage.documentClass = ChatMessageTorg;

  // ----scenes
  // CONFIG.Scene.sheetClass = torgeternitySceneConfig;
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Scene, 'torgeternity', torgeternitySceneConfig, {
    label: 'Torg Eternity Scene Config',
    makeDefault: true,
  });
  CONFIG.ui.nav = torgeternityNav;

  // ---custom user class
  // Player list disabled for now
  CONFIG.ui.players = TorgeternityPlayerList;
  CONFIG.ui.chat = TorgeternityChatLog;

  // ---cards
  CONFIG.Cards.documentClass = torgeternityCards;
  CONFIG.cardTypes = torgeternity.cardTypes;


  ui.GMScreen = new GMScreen();
  ui.macroHub = new MacroHub();
  // all settings after config
  registerTorgSettings();
  // ---register items and actors
  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet('torgeternity', TorgeternityItemSheet, {
    makeDefault: true,
  });

  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('torgeternity', TorgeternityActorSheet, {
    makeDefault: true,
  });

  // ---register cards
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Cards, 'core', torgeternityPlayerHand, {
    label: 'Torg Player Hand',
    types: ['hand'],
    makeDefault: true,
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Cards, 'core', torgeternityPile, {
    label: 'Torg Pile',
    types: ['pile'],
    makeDefault: true,
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Cards, 'core', torgeternityDeck, {
    label: 'Torg Deck',
    types: ['deck'],
    makeDefault: true,
  });
  foundry.applications.apps.DocumentSheetConfig.registerSheet(Card, 'core', torgeternityCardConfig, {
    label: 'Torg Eternity Card Configuration',
    types: ['destiny', 'drama', 'cosm'],
    makeDefault: true,
  });

  // ----------preloading handlebars templates
  preloadTemplates();
  // adding special torg buttons
  initTorgControlButtons();
  // create torg shortcuts
  createTorgShortcuts();
});

Hooks.once('i18nInit', () => {
  // ---localizing entities labels
  CONFIG.Actor.typeLabels = {
    stormknight: game.i18n.localize('torgeternity.sheetLabels.stormknight'),
    threat: game.i18n.localize('torgeternity.sheetLabels.threat'),
    vehicle: game.i18n.localize('torgeternity.sheetLabels.vehicle'),
  };
  CONFIG.Item.typeLabels = {
    ammunition: game.i18n.localize('torgeternity.itemSheetDescriptions.ammunition'),
    gear: game.i18n.localize('torgeternity.itemSheetDescriptions.generalGear'),
    eternityshard: game.i18n.localize('torgeternity.itemSheetDescriptions.eternityshard'),
    armor: game.i18n.localize('torgeternity.itemSheetDescriptions.armor'),
    shield: game.i18n.localize('torgeternity.itemSheetDescriptions.shield'),
    customAttack: game.i18n.localize('torgeternity.itemSheetDescriptions.customAttack'),
    meleeweapon: game.i18n.localize('torgeternity.itemSheetDescriptions.meleeWeapon'),
    missileweapon: game.i18n.localize('torgeternity.itemSheetDescriptions.missileWeapon'),
    firearm: game.i18n.localize('torgeternity.itemSheetDescriptions.firearm'),
    implant: game.i18n.localize('torgeternity.itemSheetDescriptions.implant'),
    heavyweapon: game.i18n.localize('torgeternity.itemSheetDescriptions.heavyWeapon'),
    vehicle: game.i18n.localize('torgeternity.itemSheetDescriptions.vehicle'),
    perk: game.i18n.localize('torgeternity.itemSheetDescriptions.perk'),
    enhancement: game.i18n.localize('torgeternity.itemSheetDescriptions.enhancement'),
    specialability: game.i18n.localize('torgeternity.itemSheetDescriptions.specialability'),
    'specialability-rollable': game.i18n.localize(
      'torgeternity.itemSheetDescriptions.specialabilityRollable'
    ),
    spell: game.i18n.localize('torgeternity.itemSheetDescriptions.spell'),
    miracle: game.i18n.localize('torgeternity.itemSheetDescriptions.miracle'),
    psionicpower: game.i18n.localize('torgeternity.itemSheetDescriptions.psionicpower'),
    customSkill: game.i18n.localize('torgeternity.itemSheetDescriptions.customSkill'),
    vehicleAddOn: game.i18n.localize('torgeternity.itemSheetDescriptions.vehicleAddOn'),
    race: game.i18n.localize('torgeternity.itemSheetDescriptions.race'),
  };

})

Hooks.once('setup', async function () {
  modifyTokenBars();
  // changing stutus marker
  // preparing status marker

  if (game.settings.get('core', 'language') === 'fr') {
    for (const effect of CONFIG.statusEffects) {
      effect.icon = effect.icon.replace(
        'systems/torgeternity/images/status-markers',
        'systems/torgeternity/images/status-markers/fr'
      );
    }
  }
});

Hooks.once('diceSoNiceReady', (dice3d) => {
  registerDiceSoNice(dice3d);
});

/*
Hooks.on("renderUIConfig", (config, html, context, options) => {
  let select = html.querySelector('[name="core.uiConfig.colorScheme.applications');
  if (select) {
    select.disabled = true;
    let hint = select.parentElement.parentElement.querySelector("p.hint");
    if (hint) hint.innerText = game.i18n.localize("torgeternity.core.forceDarkModeHint");
  }
})
  */

// -------------once everything ready
Hooks.on('ready', async function () {

  /*
  // Force DARK application colour scheme
  const uiconfig = game.settings.get('core', 'uiConfig');
  if (uiconfig.colorScheme.applications !== 'dark') {
    //ui.notifications.warn('TORG system works best when the Applications theme is set to DARK');
    uiconfig.colorScheme.applications = 'dark';
    game.settings.set('core', 'uiConfig', uiconfig);
  }
    */

  // migration script
  if (game.user.isGM) torgMigration();

  sheetResize();

  // monkey-patch explosion method for die rolls
  foundry.dice.terms.Die.prototype.explode = explode;
  foundry.dice.terms.Die.prototype.reroll = reroll;

  // adding gmScreen to UI
  ui.GMScreen = new GMScreen();

  // -----applying GM possibilities pool if absent
  if (game.user.isGM && !game.user.getFlag('torgeternity', 'GMpossibilities')) {
    game.user.setFlag('torgeternity', 'GMpossibilities', 0);
  }

  // ----load template for welcome message depending on supported languages
  let lang = game.settings.get('core', 'language');
  torgeternity.supportedLanguages.indexOf(lang) == -1 ? (lang = 'en') : (lang = lang);

  torgeternity.welcomeMessage = await foundry.applications.handlebars.renderTemplate(
    `systems/torgeternity/templates/welcomeMessage/${lang}.hbs`
  );

  // ----rendering welcome message
  if (game.settings.get('torgeternity', 'welcomeMessage') === true) {
    DialogV2.confirm({
      window: { title: 'Welcome to the Torg Eternity System for Foundry VTT!', },
      content: torgeternity.welcomeMessage,
      yes: {
        icon: 'fas fa-check',
        label: 'torgeternity.submit.OK',
      },
      no: {
        icon: 'fas fa-ban',
        label: 'torgeternity.submit.dontShow',
        callback: () => game.settings.set('torgeternity', 'welcomeMessage', false),
      },
      position: {
        top: 150,
        left: 100,
        width: 675,
      },
      actions: {
        openPack: (event, button) => {
          const packName = button.dataset.packName;
          if (packName) game.packs.get(packName).render(true);
        }
      }
    });
  }

  // ------Ask about hiding nonlocal compendium
  if (
    game.settings.get('torgeternity', 'welcomeMessage') == true &&
    !game.settings.get('torgeternity', 'hideForeignCompendium')
  ) {
    DialogV2.confirm({
      window: { title: 'torgeternity.dialogWindow.hideForeignCompendium.title', },
      content: game.i18n.localize('torgeternity.dialogWindow.hideForeignCompendium.content'),
      yes: {
        icon: 'fas fa-check',
        label: 'torgeternity.yesNo.true',
        callback: async () => {
          await game.settings.set('torgeternity', 'hideForeignCompendium', true);
          window.location.reload();
        },
      },
      no: {
        icon: 'fas fa-ban',
        label: 'torgeternity.yesNo.false',
      },
      position:
      {
        top: 100,
        left: 235,
      }
    });
  }

  // ----setup cards if needed
  if (game.settings.get('torgeternity', 'setUpCards') === true && game.user.isGM) {
    await setUpCardPiles();
  }

  // ----reset cards to initial face
  if (game.user.isGM)
    game.cards.forEach(deck => deck.cards.forEach(card => card.update({ face: 0 })));

  // activation of standart scene
  if (game.scenes.size < 1) {
    activateStandartScene();
  }
});

let externalLinks;

Hooks.on("renderSettings", async (app, html) => {
  const systemRow = html.querySelectorAll("section.info .system")?.[0];
  if (!systemRow) {
    console.warn('No system button available for links');
    return;
  }
  let button = document.createElement("button");
  button.type = "button";
  button.style.height = "auto";
  button.dataset.action = "showTorgLinks";

  const icon = document.createElement("img");
  icon.setAttribute('src', '/systems/torgeternity/images/te-logo.webp');
  icon.inert = true;
  button.append(icon);
  systemRow.insertAdjacentElement("afterend", button);

  button.addEventListener('click', () => {
    // Create dialog if not done yet
    if (!externalLinks) {
      const dialogOptions = {
        classes: ['torgeternity', 'themed', 'theme-dark', 'externalLinks'],
        window: {
          title: 'torgeternity.dialogWindow.externalLinks.title',
        },
        position: {
          left: 100,
          top: 20,
        },
        content: game.i18n.localize('torgeternity.dialogWindow.externalLinks.content'),
        buttons: [
          {
            action: 'reference',
            icon: 'fa-solid fa-expand-arrows-alt',
            label: 'torgeternity.dialogWindow.externalLinks.reference',
            callback: () => {
              new foundry.applications.sidebar.apps.FrameViewer({  // will be removed in Foundry V15
                url: 'http://torg-gamereference.com/index.php',
                window: {
                  title: 'torg game reference',
                  resizable: true,
                },
                position: {
                  top: 200,
                  left: 200,
                  width: 520,
                  height: 520,
                }
              }).render({ force: true });
            },
          },
          {
            action: 'discord',
            icon: 'fab fa-discord',
            label: 'Discord',
            callback: () => {
              ui.notifications.info(game.i18n.localize('torgeternity.notifications.openDiscord'));
              window.open('https://discord.gg/foundryvtt', '_blank');
            },
          },
          {
            action: 'bug',
            icon: 'fa-solid fa-bug',
            label: 'torgeternity.dialogWindow.externalLinks.bug',
            callback: () => {
              ui.notifications.info(game.i18n.localize('torgeternity.notifications.openIssue'));
              window.open('https://github.com/gmmatt/torgeternity/issues/new', '_blank');
            },
          },
          {
            action: 'publisher',
            cls: 'publisher',
            icon: 'systems/torgeternity/images/ulissesLogo.webp', // not FA so ignored
            label: 'torgeternity.dialogWindow.externalLinks.publisher',
            callback: () => {
              ui.notifications.info(game.i18n.localize('torgeternity.notifications.openUlisses'));
              window.open('https://ulisses-us.com', '_blank');
            },
          },
        ],
      };

      // adding french links (shamelessly)
      if (game.settings.get('core', 'language') === 'fr') {
        dialogOptions.buttons.push({
          icon: 'systems/torgeternity/images/BBE_logo.webp', // not FA so ignored
          label: '<p>Distr. français</p>',
          callback: () => {
            ui.notifications.info(
              'votre navigateur va ouvrir le site de BlackBook Editions dans un nouvel onglet  '
            );
            window.open('https://www.black-book-editions.fr/catalogue.php?id=668', '_blank');
          },
        });
      }
      externalLinks = new DialogV2(dialogOptions);
    }

    externalLinks.render({ force: true })
  })
})

// moved out of the setup hook, because it had no need to be in there
Hooks.on('hotbarDrop', (bar, dropData, slot) => {
  // return true means we are not handling this event, false means we did handle it
  if (
    dropData.type !== 'Item' &&
    dropData.type !== 'skill' &&
    dropData.type !== 'interaction' &&
    dropData.type !== 'attribute'
  )
    return true;

  createTorgEternityMacro(dropData, slot);
  return false;
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on('getMonarchHandComponents', (hand, components) => {
  components.markers.push({
    tooltip: `${game.i18n.localize('torgeternity.poolToggle.inPool')}`,
    class: 'pool-marker',
    icon: 'fas fa-tags',
    color: '#FFFFFF',
    show: (card) => card.getFlag('torgeternity', 'pooled'),
  });
  components.controls.push({
    tooltip: `${game.i18n.localize('torgeternity.monarch.discard')}`,
    class: 'discard-button',
    icon: 'fas fa-inbox',
    color: '#FFFFFF',
    onclick: (event, card) => {
      card.setFlag('torgeternity', 'pooled', false);
      if (card.type == 'destiny') {
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard), game.torgeternity.cardChatOptions);
      } else {
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').cosmDiscard), game.torgeternity.cardChatOptions);
      }
      card.toMessage({
        content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
          }"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize(
            'torgeternity.chatText.discardsCard'
          )} ${card.name}</span></div>`,
      });
    },
  });
  components.controls.push({
    tooltip: `${game.i18n.localize('torgeternity.monarch.broadcast')}`,
    class: 'broadcast-button',
    icon: 'fas fa-broadcast-tower',
    color: '#FFFFFF',
    onclick: (event, card) => {
      const image = new foundry.applications.apps.ImagePopout({ src: card.img }, { title: card.name });
      image.render(true, {
        width: 425,
        height: 650,
      });
      image.shareImage();
    },
  });
  components.controls.push({
    tooltip: `${game.i18n.localize('torgeternity.monarch.play')}`,
    class: 'play-button',
    icon: 'fas fa-play',
    color: '#FFFFFF',
    onclick: (event, card) => {
      card.setFlag('torgeternity', 'pooled', false);
      if (card.type == 'destiny') {
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard), game.torgeternity.cardChatOptions);
      } else {
        card.pass(game.cards.get(game.settings.get('torgeternity', 'deckSetting').cosmDiscard), game.torgeternity.cardChatOptions);
      }
      card.toMessage({
        content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img
          }"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize(
            'torgeternity.chatText.playsCard'
          )} ${card.name}</span></div>`,
      });
    },
  });
  components.controls.push({
    class: 'pool-toggle',
    tooltip: `${game.i18n.localize('torgeternity.poolToggle.toogle')}`,
    icon: 'fas fa-tags',
    color: '#FFFFFF',
    onclick: (event, card) =>
      card.setFlag('torgeternity', 'pooled', !card.getFlag('torgeternity', 'pooled')),
  });
});

async function createTorgEternityMacro(dropData, slot) {
  const document = dropData.uuid ? fromUuidSync(dropData.uuid) : dropData.data;
  // Create the macro command
  let command = null;
  let macro = null;
  let macroName = null;
  let macroImg = null;
  let macroFlag = null;

  if (dropData.type === 'Item') {
    macroFlag = 'itemMacro';
    command = `game.torgeternity.rollItemMacro("${document.name}");`;
    macroName = document.name;
    macroImg = document.img;
  } else {
    // attribute, skill, interaction
    macroFlag = 'skillMacro';

    const dropName = document.name;
    const dropAttribute = document.attribute;
    const isInteractionAttack = dropData.type === 'interaction';

    command = `game.torgeternity.rollSkillMacro("${dropName}", "${dropAttribute}", ${isInteractionAttack});`;

    const locSkillName = (dropName !== dropAttribute) && game.i18n.localize('torgeternity.skills.' + dropName);
    const locAttributeName = game.i18n.localize('torgeternity.attributes.' + dropAttribute);

    if (dropData.type === 'skill')
      macroName = locSkillName + '/' + locAttributeName;
    else if (dropData.type === 'attribute')
      macroName = locAttributeName;
    else if (dropData.type === 'interaction')
      macroName = locSkillName;

    if (dropData.type === 'attribute') {
      // this is an attribute test
      // use built-in foundry icons
      if (dropAttribute === 'charisma')
        macroImg = 'icons/skills/social/diplomacy-handshake.webp';
      else if (dropAttribute === 'dexterity')
        macroImg = 'icons/skills/movement/feet-winged-boots-brown.webp';
      else if (dropAttribute === 'mind')
        macroImg = 'icons/sundries/books/book-stack.webp';
      else if (dropAttribute === 'spirit')
        macroImg = 'icons/magic/life/heart-shadow-red.webp';
      else if (dropAttribute === 'strength')
        macroImg = 'icons/magic/control/buff-strength-muscle-damage.webp';
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
    const macroData = {
      name: macroName,
      type: 'script',
      command: command,
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
      flags: { torgeternity: { [macroFlag]: true, }, },
    };
    if (macroImg) macroData.img = macroImg;

    macro = await Macro.create(macroData);
  }

  game.user.assignHotbarMacro(macro, slot);
}

/**
 * Triggered to roll for an item on the caller's default character.
 *
 * @param {string} itemName
 * @returns {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(item => item.name === itemName) : null;
  if (!item)
    return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noItemNamed') + itemName);

  // Trigger the item roll
  switch (item.type) {
    case 'customAttack':
    case 'meleeweapon':
    case 'missileweapon':
    case 'firearm':
    case 'energyweapon':
    case 'heavyweapon':
    case 'specialability-rollable':
      {
        // The following is copied/pasted/adjusted from _onAttackRoll in TorgeternityActorSheet
        const weaponData = item.system;
        const { attackWith, damageType, weaponDamage } = weaponData;
        const skillData = actor.system.skills?.[attackWith] || item.system?.gunner;
        let dnDescriptor = 'standard';
        let adjustedDamage;
        const attributes = actor.system.attributes;

        // Modify dnDecriptor if target exists
        if (game.user.targets.size) {
          const firstTarget = game.user.targets.find(token => token.actor.type !== 'vehicle')?.actor ||
            game.user.targets.first().actor;

          switch (attackWith) {
            case 'meleeWeapons':
            case 'unarmedCombat':
              firstTarget.items
                .filter((it) => it.type === 'meleeweapon')
                .filter((it) => it.system.equipped).length === 0
                ? (dnDescriptor = 'targetUnarmedCombat')
                : (dnDescriptor = 'targetMeleeWeapons');
              break;
            case 'fireCombat':
            case 'energyWeapons':
            case 'heavyWeapons':
            case 'missileWeapons':
              dnDescriptor = 'targetDodge';
              break;
            default:
              dnDescriptor = 'targetMeleeWeapons';
          }
          if (firstTarget.type === 'vehicle') {
            dnDescriptor = 'targetVehicleDefense';
          }
        }

        // Calculate damage caused by weapon
        switch (damageType) {
          case 'flat':
            adjustedDamage = weaponDamage;
            break;
          case 'strengthPlus':
            adjustedDamage = attributes.strength.value + parseInt(weaponDamage);
            break;
          case 'charismaPlus':
            adjustedDamage = attributes.charisma.value + parseInt(weaponDamage);
            break;
          case 'dexterityPlus':
            adjustedDamage = attributes.dexterity.value + parseInt(weaponDamage);
            break;
          case 'mindPlus':
            adjustedDamage = attributes.mind.value + parseInt(weaponDamage);
            break;
          case 'spiritPlus':
            adjustedDamage = attributes.spirit.value + parseInt(weaponDamage);
            break;
          default:
            adjustedDamage = parseInt(weaponDamage);
        }

        new TestDialog({
          testType: 'attack',
          actor: actor.uuid,
          actorType: actor.type,
          item: item,
          isAttack: true,
          amountBD: 0,
          isFav: skillData.isFav,
          actorPic: actor.img,
          actorName: actor.name,
          skillName: attackWith,
          skillBaseAttribute: skillData.baseAttribute,
          skillValue: skillData?.value || skillData?.skillValue,
          skillAdds: skillData.adds,
          unskilledUse: true,
          rollTotal: 0,
          DNDescriptor: dnDescriptor,
          weaponName: item.name,
          weaponDamageType: damageType,
          weaponDamage: weaponData.damage,
          damage: adjustedDamage,
          weaponAP: weaponData.ap,
          applyArmor: true,
          applySize: true,
          attackOptions: true,
          chatNote: weaponData.chatNote,
          bdDamageLabelStyle: 'display:none',
          bdDamageSum: 0,
        }, { useTargets: true });
      }
      break;

    case 'psionicpower':
    case 'miracle':
    case 'spell':
      {
        const powerData = item.system;
        const skillName = powerData.skill;
        const skillData = actor.system.skills[skillName];

        new TestDialog({
          testType: 'power',
          DNDescriptor: game.user.targets.size ? powerData.dn : 'standard',
          actor: actor.uuid,
          actorPic: actor.img,
          actorName: actor.name,
          actorType: actor.type,
          powerName: item.name,
          powerModifier: item.system.modifier || 0,
          isAttack: powerData.isAttack,
          amountBD: 0,
          skillName: skillName,
          skillBaseAttribute: game.i18n.localize('torgeternity.skills.' + skillData.baseAttribute),
          skillAdds: skillData.adds,
          skillValue: skillData.value,
          unskilledUse: false,
          damage: powerData.damage,
          weaponAP: powerData.ap,
          applyArmor: powerData.applyArmor,
          applySize: powerData.applySize,
          attackOptions: true,
          rollTotal: 0,
          bdDamageLabelStyle: 'display:none',
          bdDamageSum: 0,
        }, { useTargets: true });
      }
      break;

    default:
      // this will cause the item to be printed to the chat
      return item.roll();
  }
}

/**
 * Create a Macro from a skill, attribute, or interaction (?) drop.
 * Get an existing macro if one exists, otherwise create a new one.
 *
 * @param {string} skillName
 * @param {string} attributeName
 * @param {boolean} isInteractionAttack
 * @returns {Promise}
 */
function rollSkillMacro(skillName, attributeName, isInteractionAttack, DNDescriptor) {
  if (DNDescriptor && torgChecks.validDNDescriptor(DNDescriptor) === false) {
    ui.notifications.error('The DN-Descriptor is wrong. Exiting the macro.');
    return;
  }

  const speaker = ChatMessage.getSpeaker();
  let actor = null;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const isAttributeTest = skillName === attributeName;
  let skill = null;
  if (!isAttributeTest) {
    const skillNameKey = skillName; // .toLowerCase(); // skillName required to be internal value
    // would be nice to use display value as an input instead but we can't translate from i18n to internal values
    skill =
      actor && Object.keys(actor.system.skills).includes(skillNameKey)
        ? actor.system.skills[skillNameKey]
        : null;
    if (!skill)
      return ui.notifications.warn(
        game.i18n.localize('torgeternity.notifications.noSkillNamed') + skillName
      );
  }

  const attributeNameKey = attributeName.toLowerCase();
  const attribute =
    actor && Object.keys(actor.system.attributes).includes(attributeNameKey)
      ? actor.system.attributes[attributeNameKey]
      : null;
  if (!attribute)
    return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noItemNamed'));
  if (isAttributeTest) {
    // dummy skill object since there's no actual skill in this case
    skill = {
      baseAttribute: attributeNameKey,
      adds: 0,
      value: attribute,
      isFav: actor.system.attributes[attributeNameKey + 'IsFav'],
      groupName: 'other',
      unskilledUse: 1,
    };
  }

  // calculate the value using the attribute and skill adds, as the attribute might be different
  //    than the skill's current baseAttribute. This assumes the actor is a stormknight - different
  //    logic is needed for threats, who don't have adds.
  let skillValue = attribute.value;
  if (!isAttributeTest) {
    if (actor.type === 'stormknight') {
      skillValue += skill.adds;
    } else if (actor.type == 'threat') {
      const otherAttribute = actor.system.attributes[skill.baseAttribute];
      skillValue = Math.max(skill.value, otherAttribute.value);
    }
  }
  // Trigger the skill roll
  // The following is copied/pasted/adjusted from _onSkillRoll and _onInteractionAttack in TorgeternityActorSheet
  // This code needs to be centrally located!!!
  const test = {
    testType: isAttributeTest ? 'attribute' : 'skill',
    actor: actor.uuid,
    actorPic: actor.img,
    actorName: actor.name,
    actorType: actor.type,
    skillName: isAttributeTest ? attributeName : skillName,
    skillBaseAttribute: game.i18n.localize('torgeternity.attributes.' + attributeName),
    skillAdds: skill.adds,
    skillValue: skillValue,
    isFav: skill.isFav,
    DNDescriptor: DNDescriptor ?? 'standard',
    rollTotal: 0,
    unskilledUse: skill.unskilledUse,
    chatNote: '',
    woundModifier: parseInt(-actor.system.wounds.value),
    stymiedModifier: actor.statusModifiers.stymied,
    darknessModifier: 0, // parseInt(actor.system.darknessModifier),
    type: 'skill',
    bdDamageLabelStyle: 'display:none',
    bdDamageSum: 0,
  };

  if (isInteractionAttack) {
    test.testType = 'interactionAttack';
    test.interactionAttackType = skillName;
    // Darkness seems like it would be hard to determine if it should apply to
    //    skill/attribute tests or not, maybe should be option in dialog?

    // Exit if no target or get target data
    let dnDescriptor;
    if (game.user.targets.size && !DNDescriptor) {
      switch (skillName) {
        case 'intimidation':
          dnDescriptor = 'targetIntimidation';
          break;
        case 'maneuver':
          dnDescriptor = 'targetManeuver';
          break;
        case 'taunt':
          dnDescriptor = 'targetTaunt';
          break;
        case 'trick':
          dnDescriptor = 'targetTrick';
          break;
        default:
          dnDescriptor = 'standard';
      }
    } else {
      dnDescriptor = 'standard';
    }
    test.DNDescriptor = dnDescriptor ?? DNDescriptor;
    test.unskilledUse = true;
  }

  new TestDialog(test, { useTargets: true });
}

Hooks.on('renderCombatTracker', (combatTracker) => {
  const hands = game.cards;
  for (const hand of hands) {
    hand.apps[combatTracker.id] = combatTracker;
  }
});

Hooks.on('changeSidebarTab', (tabDirectory) => {
  if (game.settings.get('torgeternity', 'hideForeignCompendium') == true) {
    hideCompendium(game.settings.get('core', 'language'), tabDirectory);
  }
});

Hooks.on('updateActor', (actor, change, options, userId) => {
  // updating playerList with users character up-to-date data
  ui.players.render(true);

  if (actor.type === 'stormknight') {
    const hand = actor.getDefaultHand();
    // If there is no hand for that SK, and a GM is online, create one
    if (!hand && game.user.isActiveGM) {
      actor.createDefaultHand();
    }
    // If the update includes permissions, sync them to the hand
    if (hand && change.ownership && game.userId === userId) {
      // DO NOT PUT ANYTHING ELSE IN THIS UPDATE! diff:false, recursive:false can easily nuke stuff
      hand.update({ ownership: actor.getHandOwnership() }, { diff: false, recursive: false });
    }
  }
});

// change the generic threat token to match the cosm's one if it's set in the scene
Hooks.on('preCreateToken', async (...args) => {
  if (args[0].texture.src.includes('threat')) {
    const cosm = canvas.scene.getFlag('torgeternity', 'cosm');
    if (!cosm) return;
    if (
      [
        'coreEarth',
        'livingLand',
        'nileEmpire',
        'aysle',
        'cyberpapacy',
        'tharkold',
        'panPacifica',
        'orrorsh',
      ].includes(cosm)
    )
      args[0].updateSource({
        'texture.src': 'systems/torgeternity/images/characters/threat-' + cosm + '.Token.webp',
      });
  }
});

// by default creating a  hand for each stormknight
Hooks.on('createActor', async (actor, options, userId) => {
  // run by first active GM. Will be skipped if no GM is present, but that's the best we can do at the moment
  if (actor.type === 'stormknight' && game.user.isActiveGM) {
    await actor.createDefaultHand();
  }
});

// un-pool cards of SK when the GM ends the combat encounter
Hooks.on('deleteCombat', async (combat, dataUpdate) => {
  if (!game.user.isActiveGM) return;

  // listing of hands' actors in closing combat
  combat.combatants.filter(combatant => combatant.actor.type === 'stormknight')
    .forEach(combatant => {
      const hand = game.actors.get(combatant.actorId).getDefaultHand();
      // delete the flag that give the pooled condition in each card of each hand
      if (hand) hand.cards.forEach(card => card.unsetFlag('torgeternity', 'pooled'))
    });

  await deleteActiveDefense(combat);
});

Hooks.on('deleteActor', async (actor, data1, data2) => {
  if (game.user.isActiveGM && actor.type === 'stormknight')
    actor.getDefaultHand()?.delete();
});

Hooks.on('dropActorSheetData', async (myActor, mySheet, dropItem) => {
  // When a "non-vehicle actor" is dropped on a "vehicle actor", proposes to replace the driver and his skill value
  if (
    (myActor.type === 'vehicle' && (await fromUuidSync(dropItem.uuid)?.type) === 'stormknight') ||
    ((await fromUuidSync(dropItem.uuid)?.type) === 'threat' &&
      (await fromUuidSync(dropItem.uuid)?.type) !== 'vehicle')
  ) {
    const myVehicle = myActor;
    const driver = fromUuidSync(dropItem.uuid);
    const skill = myVehicle.system.type.toLowerCase();
    const skillValue = driver?.system?.skills[skill + 'Vehicles']?.value ?? 0;
    if (skillValue > 0) {
      myVehicle.update({
        'system.operator.name': driver.name,
        'system.operator.skillValue': skillValue,
      });
    } else if (skillValue === 0) {
      ui.notifications.warn(
        await game.i18n.format('torgeternity.notifications.noCapacity', { a: driver.name })
      );
    }
    return;
  }
});

// When the turn taken button is hit, delete "until end of turn" effects (stymied/vulnerable)
Hooks.on('updateCombatant', async (combatant, changes, options, userId) => {
  if (game.user.hasRole(CONST.USER_ROLES.GAMEMASTER) && changes.flags?.world?.turnTaken) {
    const myActor = combatant.actor;
    for (const ef of myActor.effects.filter((e) => e.duration.type === 'turns')) {
      if (ef.name === 'ActiveDefense') continue;
      await myActor.updateEmbeddedDocuments('ActiveEffect', [
        {
          _id: ef.id,
          'duration.turns': ef.duration.turns - 1,
          'duration.rounds': ef.duration.rounds - 1,
        },
      ]);
      if (!ef.duration.remaining) await ef.delete();
    }
  }
});

// deactivate active defense when the combat round is progressed. End of combat is in the hook above, 'deleteCombat'
Hooks.on('combatRound', await deleteActiveDefense);

async function deleteActiveDefense(...args) {
  if (!game.user.isGM) return;

  const combatants = args[0].combatants;

  for (const combatant of combatants) {
    const activeDefenseEffect = combatant.actor.appliedEffects.find(
      (eff) => eff.name === 'ActiveDefense'
    );
    if (activeDefenseEffect) await activeDefenseEffect.delete();
  }
}

Hooks.on('getActorContextOptions', async (actorDir, menuItems) => {

  menuItems.unshift({
    name: 'torgeternity.contextMenu.characterInfo.contextMenuTitle',
    icon: '<i class="fa-regular fa-circle-info"></i>',
    callback: async (li) => {
      const actor = actorDir.collection.get(li.dataset.entryId);

      let description = actor.system.details.background ?? actor.system.details.description ?? actor.system.description ?? '';
      description = `<div class="charInfoOutput">${description}</div>`;

      DialogV2.wait({
        classes: ['torgeternity', 'themed', 'theme-dark', 'charInfoOutput'],
        window: {
          title: game.i18n.format('torgeternity.contextMenu.characterInfo.windowTitle', {
            a: actor.name,
          }),
          contentClasses: ['scrollable'],
        },
        position: {
          width: 800
        },
        content: await foundry.applications.ux.TextEditor.enrichHTML(description),
        buttons: [
          {
            action: 'close',
            label: 'torgeternity.dialogWindow.buttons.ok',
            callback: () => { },
          },
          {
            action: 'showAllPlayers',
            label: 'torgeternity.dialogPrompts.showToPlayers',
            callback: (event, button, dialog) => {
              ChatMessage.create({
                content: dialog.element.querySelector('.charInfoOutput').outerHTML,
              });
            },
          },
        ]
      });
    },
  });
});


Hooks.on('renderJournalEntryPageSheet', (sheet, element, document, options) => {
  element.classList.add('themed', 'theme-light');
})