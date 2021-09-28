export function registerTorgSettings() {


    //--------welcome message 

    game.settings.register("torgeternity", "welcomeMessage", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "display the welcome message", // Register a module setting with checkbox
        hint: "If checked, the welcome message will pop up after your world loads.", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: true, // The default value for the setting
    });

    //------pause image

    game.settings.register("torgeternity", "pauseMedia", {
        // game.setting.register("NameOfTheModule", "VariableName",
        name: "pause image media", // Register a module setting with checkbox
        hint: "Choose the image that is displayed when the game is paused.", // Description of the settings
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
        hint: "If checked, enable chat card animations. Changing this setting will reload the app", // Description of the settings
        scope: "world", // This specifies a client-stored setting
        config: true, // This specifies that the setting appears in the configuration view
        type: Boolean,
        default: true, // The default value for the setting
        onChange: () => window.location.reload()
    });

    //GM Screen
    game.settings.register("torgeternity", "gmScreen", {
        name: "Select the GM Screen You Want to Use",
        hint: "You can select a GM screen from any active module. If you select a module that is not installed, the GM screen function may not work properly. NOTE: you need to refresh your browser (F5) after switching screens.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            torgEternity: "Core Rulebook GM Screen",
            livingLand: "Living Land GM Screen"
        }
    })

}


function setCosmCard(cosm, path) {
    let cards = document.getElementsByClassName("cosm-card");
    for (let card of cards) {
        if (card.classList.contains(cosm)) {
            card.style.background = `url(${path})`

        }
    }

}
