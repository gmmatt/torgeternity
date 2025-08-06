import { PossibilityByCosm } from './possibilityByCosm.js';
import TorgeternityActor from './documents/actor/torgeternityActor.js';

/**
 *
 */
export default function createTorgShortcuts() {
  // creating keyboard shortcuts
  game.keybindings.register('torgeternity', 'openHand', {
    name: game.i18n.localize('torgeternity.dialogPrompts.openHand'),
    editable: [{ key: 'KeyH', },],
    onDown: (context) => {
      TorgeternityActor.getControlledActor()?.getDefaultHand().sheet.toggleRender();
    },
  });
  game.keybindings.register('torgeternity', 'openGMScreen', {
    name: game.i18n.localize('torgeternity.gmScreen.toggle'),
    editable: [{ key: 'KeyG', },],
    onDown: (context) => {
      if (game.user.isGM) ui.GMScreen.toggleRender();
    },
  });
  game.keybindings.register('torgeternity', 'openCosmPoss', {
    name: 'Possibility by cosm', // game.i18n.localize("torgeternity.gmScreen.toggle"),
    editable: [{ key: 'KeyP', },],
    onDown: (context) => {
      const actor = TorgeternityActor.getControlledActor();
      if (actor) PossibilityByCosm.toggleRender(actor);
    },
  });
}
