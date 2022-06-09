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
    /*
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

        */
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
        choices: CONFIG.torgeternity.availableScreens,
        default: "none"
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
    game.settings.register("torgeternity", "autoDamages", {
        name: "torgeternity.settingMenu.autoDamages.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.autoDamages.hint", // Description of the settings
        scope: "world",
        config: true,
        type: Boolean,
        default: false,

    });

    // the deck setting menu
    game.settings.registerMenu("torgeternity", "cardDecks", {
        name: "torgeternity.settingMenu.deckSetting.name",
        label: "torgeternity.settingMenu.deckSetting.label", // The text label used in the button
        hint: "torgeternity.settingMenu.deckSetting.hint",
        icon: "fas fa-bars",
        title: "torgeternity.settingMenu.deckSetting.name", // A Font Awesome icon used in the submenu button
        type: deckSettingMenu, // A FormApplication subclass
        restricted: true // only GM can manage default decks
    });

    // the deck setting 
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
            stormknightsHands: {}
        }
    });

    // disabling the clearance and XP for players
    //---------Set up Cards
    game.settings.register("torgeternity", "disableXP", {
        name: "torgeternity.settingMenu.disableXP.name", // Register a module setting with checkbox
        hint: "torgeternity.settingMenu.disableXP.hint", // Description of the settings
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });



}