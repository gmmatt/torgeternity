export function registerTorgSettings() {


    //--------welcome message 

    game.settings.register("torgeternity", "welcomeMessage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "display the welcome message", // Register a module setting with checkbox
        hint: "If checked, the welcome message will pop once your world loaded", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: true, // The default value for the setting
    });

    //------pause image

    game.settings.register("torgeternity", "pauseMedia", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "pause image media", // Register a module setting with checkbox
        hint: "choose the image displayed when the game is paused", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/pause.webp',
        scope: 'world',
        config: true,
        restricted: true,
        
    });
    //animated chat messages

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

    game.settings.register("torgeternity", "aysleCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "Aysle card image", // Register a module setting with checkbox
        hint: "the path of the image for the Aysle Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/aysle.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("aysle", path);
        }
    });
    game.settings.register("torgeternity", "coreEarthCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "coreEarth card image", // Register a module setting with checkbox
        hint: "the path of the image for the coreEarth Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/coreEarth.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("coreEarth", path);
        }
    });
    game.settings.register("torgeternity", "livingLandCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "livingLand card image", // Register a module setting with checkbox
        hint: "the path of the image for the livingLand Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/livingLand.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("livingLand", path);
        }
    });
    game.settings.register("torgeternity", "orrorshCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "orrorsh card image", // Register a module setting with checkbox
        hint: "the path of the image for the orrorsh Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/orrorsh.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("orrorsh", path);
        }
    });
    game.settings.register("torgeternity", "panPacificaCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "panPacifica card image", // Register a module setting with checkbox
        hint: "the path of the image for the panPacifica Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/panPacifica.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("panPacifica", path);
        }
    });
    game.settings.register("torgeternity", "tharkoldCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "tharkold card image", // Register a module setting with checkbox
        hint: "the path of the image for the tharkold Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/tharkold.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("tharkold", path);
        }
    });
    game.settings.register("torgeternity", "cyberpapacyCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "cyberpapacy card image", // Register a module setting with checkbox
        hint: "the path of the image for the cyberpapacy Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/cyberpapacy.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("cyberpapacy", path);
        }
    });
    game.settings.register("torgeternity", "nileEmpireCardImage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "nileEmpire card image", // Register a module setting with checkbox
        hint: "the path of the image for the nileEmpire Cosm card", // Description of the settings
        type: window.Azzu.SettingsTypes.FilePickerImage,
        default: 'systems/torgeternity/images/cosm-cards/nileEmpire.webp',
        scope: 'world',
        config: true,
        restricted: true,
        onChange: path => {
            setCosmCard("nileEmpire", path);
        }
    });

}



function setCosmCard(cosm, path) {
    let cards = document.getElementsByClassName("cosm-card");
    for (let card of cards) {
        if (card.classList.contains(cosm)) {
            card.style.background = `url(${path})`

        }
    }

}
