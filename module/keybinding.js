import GMScreen from './GMScreen.js';
export default function createTorgShortcuts() {
    //creating keyboard shortcuts
    game.keybindings.register('torgeternity', 'openHand', {
        name: "test open hand",
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
        name: "test open screen",
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