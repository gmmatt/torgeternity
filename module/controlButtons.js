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

  Hooks.on('getSceneControlButtons', (btns) => {
    const menu = [
      {
        name: game.i18n.localize('CARDS.TypeHand'),
        title: game.i18n.localize('CARDS.TypeHand'),
        icon: 'fa fa-id-badge',
        button: true,
        onClick: () => {
          if (game.user.character) {
            game.user.character.getDefaultHand().sheet.toggleRender();
          } else {
            ui.notifications.error(game.i18n.localize('torgeternity.notifications.noHands'));
          }
        },
      },
    ];

    if (game.user.isGM) {
      menu.push(
        {
          name: game.i18n.localize('torgeternity.gmScreen.toggle'),
          title: game.i18n.localize('torgeternity.gmScreen.toggle'),
          icon: 'fa fa-book-open',
          button: true,
          onClick: () => {
            ui.GMScreen.toggleRender();
          },
        },
        {
          name: game.i18n.localize('torgeternity.settingMenu.deckSetting.name'),
          title: game.i18n.localize('torgeternity.settingMenu.deckSetting.name'),
          icon: 'fa fa-cog',
          button: true,
          onClick: () => {
            new DeckSettingMenu().render(true);
          },
        },
        {
          name: game.i18n.localize('torgeternity.macros.macroHub.buttonTitle'),
          title: game.i18n.localize('torgeternity.macros.macroHub.buttonTitle'),
          icon: 'fa-solid fa-bottle-water',
          button: true,
          onClick: () => {
            ui.macroHub.toggleRender();
          },
        }
      );
    }

    btns.torg = {
      name: 'TORG',
      title: 'TORG',
      icon: 'torg',
      layer: 'torgeternity',
      tools: menu,
    };
  });
}
