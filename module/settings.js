import deckSettingMenu from './cards/cardSettingMenu.js';
export function registerTorgSettings() {


    //--------welcome message 

    game.settings.register("torgeternity", "welcomeMessage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "torgeternity.settingMenu.welcome.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.welcome.hint", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: true, // The default value for the setting
    });

    //---------Set up Cards
    game.settings.register("torgeternity", "setUpCards", {
        name: "torgeternity.settingMenu.setupCards.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.setupCards.hint", // Description of the settings
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    //------pause image

    game.settings.register("torgeternity", "pauseMedia", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "torgeternity.settingMenu.pauseMedia.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.pauseMedia.hint", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: {},
        scope: 'world',
        config: true,
        restricted: true,

    });
    //animated chat messages

    game.settings.register("torgeternity", "animatedChat", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "torgeternity.settingMenu.animatedChat.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.animatedChat.hint", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: true, // The default value for the setting
        onChange: () => window.location.reload()
    });


    //GM Screen
    game.settings.register("torgeternity", "gmScreen", {
        name: "torgeternity.settingMenu.gmScreen.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.gmScreen.hint", // Description of the settings
        scope: "world",
        config: true,
        type: String,
        choices: {
            torgEternity: "Core Rulebook GM Screen",
            livingLand: "Living Land GM Screen"
        },
        default: "torgEternity"
    });

    //Hide Compendiums
    game.settings.register("torgeternity", "hideForeignCompendium", {
        name: "torgeternity.settingMenu.hideForeignCompendium.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.hideForeignCompendium.hint", // Description of the settings
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => window.location.reload()

    });

    /* Temporarily removing this, but we may put back in once we have a good solution for a per-character deck
    game.settings.register("torgeternity", "defaultUserHand", {
        name: "torgeternity.settingMenu.defaultUserHand.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.defaultUserHand.hint", // Description of the settings
        scope: "client",
        config: true,
        type: String,
        default: false,

    });
    */

    game.settings.registerMenu("torgeternity", "cardDecks", {
        name: "torgeternity.settingMenu.deckSetting.name",
        label: "torgeternity.settingMenu.deckSetting.label", // The text label used in the button
        hint: "torgeternity.settingMenu.deckSetting.hint",
        icon: "fas fa-bars",
        title: "deck settings", // A Font Awesome icon used in the submenu button
        type: deckSettingMenu, // A FormApplication subclass
        restricted: true // only GM can manage default decks
    });


    game.settings.register('torgeternity', 'deckSetting', {
        scope: 'world',
        config: false,
        type: Object,
        default: {
            destinyDeck: "Destiny Deck",
            destinyDiscard: "Destiny Discard",
            dramaDeck: "Drama Deck",
            dramaActive: "Active Drama Card",
            dramaDiscard: "Drama Discard",
            cosmDiscard: "Cosm Discard",
            coreEarth: "Core Earth Cosm Deck",
            aysle: "Aysle Cosm Deck",
            cyberpapacy: "Cyberpapacy Cosm Deck",
            livingLand: "Living Land Cosm Deck",
            nileEmpire: "Nile Empire Cosm Deck",
            orrorsh: "Orrorsh Cosm Deck",
            panPacifica: "Pan Pacifica Cosm Deck",
            tharkold: "Tharkold Cosm Deck",
            stormknights: {}
        }
    });

    //Cards
    /* These settings not used for now. May come back and apply them later
    game.settings.register("torgeternity", "activeDestinyDeck", {
        name: "Active Destiny Deck",
        hint: "Name of the deck that players should use to draw Destiny cards.",
        scope: "world",
        config: true,
        type: String,
        default: "Destiny Deck"

    })

    game.settings.register("torgeternity", "activeCosmDeck", {
        name: "Active Cosm Deck",
        hint: "Name of the deck that players should use to draw Cosm cards.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            coreEarth: "Core Earth Cosm Deck",
            aysle: "Aysle Cosm Deck",
            cyberPapacy: "Cyberpapacy Cosm Deck",
            livingLand: "Living Land Cosm Deck",
            nileEmpire: "Nile Empire Cosm Deck",
            orrorsh: "Orrorsh Cosm Deck",
            panPacifica: "Pan Pacifica Cosm Deck",
            tharkold: "Tharkold Cosm Deck"
        }
    })
    */
    /*
        game.settings.register("torgeternity", "activeDramaDeck", {
            name: "Active Drama Deck",
            hint: "Name of the deck that is used to draw Drama cards.",
            scope: "world",
            config: true,
            type: String,
            choices: {
                coreDrama: "Drama Deck",
                coreEarth: "Core Earth Drama Deck",
                aysle: "Aysle Drama Deck",
                cyberPapacy: "Cyberpapacy Drama Deck",
                livingLand: "Living Land Drama Deck",
                nileEmpire: "Nile Empire Drama Deck",
                orrorsh: "Orrorsh Drama Deck",
                panPacifica: "Pan Pacifica Drama Deck",
                tharkold: "Tharkold Drama Deck"
            }
        
        })
    */

    /* function setCosmCard(cosm, path) {
        let cards = document.getElementsByClassName("cosm-card");
        for (let card of cards) {
            if (card.classList.contains(cosm)) {
                card.style.background = `url(${path})`

            }
        }

    } 
    */
}