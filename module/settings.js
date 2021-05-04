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

    // Card Installer
    game.settings.register("torgeternity", "cardInstaller", {
        name: "Ask to Install Drama Deck",
        hint: "When checked, the game will prompt to install the Drama Deck (Card Support module must be active)",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => window.location.reload()
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
