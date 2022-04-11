import GMScreen from './GMScreen.js';
export default function createTorgShortcuts() {
    //creating keyboard shortcuts
    game.keybindings.register('torgeternity', 'openHand', {
        name: game.i18n.localize("CARDS.TypeHand"),
        editable: [{
            key: "KeyH",
        }],
        onDown: (context) => {
            if (game.user.character) {
                game.user.character.getDefaultHand().sheet.render(true)
            }
        }
    });
    game.keybindings.register('torgeternity', 'openGMScreen', {
        name: game.i18n.localize("torgeternity.gmScreen.toggle"),
        editable: [{
            key: "KeyG",
        }],
        onDown: (context) => {
            if (game.user.isGM) {
                new GMScreen().render(true)
            }
        }
    });

}