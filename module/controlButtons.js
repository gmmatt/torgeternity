import DeckSettingMenu from './cards/cardSettingMenu.js';

/**
 *
 */
export default function initTorgControlButtons() {
  // adding layer control for Torg entities
  /**
   *
   */
  CONFIG.Canvas.layers.torgeternity = { layerClass: foundry.canvas.layers.ControlsLayer, group: 'primary' };

  Hooks.on('getSceneControlButtons', (controls) => {

    controls.torg = {
      name: 'torg',
      title: 'TORG',
      icon: 'torg',
      layer: 'torgeternity',
      tools: {
        playerHand:
        {
          name: 'playerHand',
          title: 'TYPES.Cards.hand',
          icon: 'fa fa-id-badge',
          button: true,
          onChange: () => {
            if (game.user.character) {
              game.user.character.getDefaultHand().sheet.toggleRender();
            } else {
              ui.notifications.error(game.i18n.localize('torgeternity.notifications.noHands'));
            }
          },
        },
        gmScreen:
        {
          name: 'gmScreen',
          title: 'torgeternity.gmScreen.toggle',
          icon: 'fa fa-book-open',
          button: true,
          onChange: () => ui.GMScreen.toggleRender(),
          visible: game.user.isGM,
        },
        deckSettings:
        {
          name: 'deckSettings',
          title: 'torgeternity.settingMenu.deckSetting.name',
          icon: 'fa fa-cog',
          button: true,
          onChange: () => new DeckSettingMenu().render(true),
          visible: game.user.isGM,
        },
        macroHub:
        {
          name: 'macroHub',
          title: 'torgeternity.macros.macroHub.buttonTitle',
          icon: 'fa-solid fa-bottle-water',
          button: true,
          onChange: () => ui.macroHub.toggleRender(),
          visible: game.user.isGM,
        }
      }
    };
  });
}
