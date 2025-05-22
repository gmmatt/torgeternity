import DeckSettingMenu from './cards/cardSettingMenu.js';

/**
 *
 */
export default function initTorgControlButtons() {
  // adding layer control for Torg entities
  /**
   *
   */
  CONFIG.Canvas.layers.torgeternity = {
    layerClass: foundry.canvas.layers.ControlsLayer,
    group: 'primary',
  };

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
        },
        {
          name: game.i18n.localize('torgeternity.settingMenu.externalLinks.name'),
          title: game.i18n.localize('torgeternity.settingMenu.externalLinks.title'),
          onClick: () => {
            const dialData = {
              title: game.i18n.localize('torgeternity.dialogWindow.externalLinks.title'),
              content: game.i18n.localize('torgeternity.dialogWindow.externalLinks.content'),
              buttons: {
                one: {
                  icon: '<i class="fas fa-expand-arrows-alt"style="font-size:24px"></i>',
                  label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.reference'),
                  callback: () => {
                    new FrameViewer('http://torg-gamereference.com/index.php', {
                      title: 'torg game reference',
                      top: 200,
                      left: 200,
                      width: 520,
                      height: 520,
                      resizable: true,
                    }).render(true);
                  },
                },
                two: {
                  icon: '<i class="fab fa-discord"style="font-size:24px"></i>',
                  label: '<p>Discord</p>',
                  callback: () => {
                    ui.notifications.info(
                      game.i18n.localize('torgeternity.notifications.openDiscord')
                    );
                    window.open('https://discord.gg/foundryvtt', '_blank');
                  },
                },

                three: {
                  icon: '<i class="fas fa-bug" style="font-size:24px"></i>',
                  label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.bug'),
                  callback: () => {
                    ui.notifications.info(
                      game.i18n.localize('torgeternity.notifications.openIssue')
                    );
                    window.open('https://github.com/gmmatt/torgeternity/issues/new', '_blank');
                  },
                },
                four: {
                  icon: '<img src="systems/torgeternity/images/ulissesLogo.webp" alt="logo ulisses" style="filter:grayscale(1)">',
                  label: game.i18n.localize('torgeternity.dialogWindow.externalLinks.publisher'),
                  callback: () => {
                    ui.notifications.info(
                      game.i18n.localize('torgeternity.notifications.openUlisses')
                    );
                    window.open('https://ulisses-us.com', '_blank');
                  },
                },
              },
            };
            const dialOption = {
              width: 'auto',
              height: 250,
              left: 100,
              top: 20,
            };
            // adding french links (shamelessly)
            if (game.settings.get('core', 'language') == 'fr') {
              dialData.buttons.five = {
                icon: '<img src="systems/torgeternity/images/BBE_logo.webp" alt="logo BBE" style="filter:grayscale(1);max-height:3em">',
                label: '<p>Distr. français</p>',
                callback: () => {
                  ui.notifications.info(
                    'votre navigateur va ouvrir le site de BlackBook Editions dans un nouvel onglet  '
                  );
                  window.open('https://www.black-book-editions.fr/catalogue.php?id=668', '_blank');
                },
              };
            }
            new Dialog(dialData, dialOption).render(true);
          },
        }
      );
    }

    btns['TORG'] = {
      // TODO: Look at the properties, this doesn't work anymore anyhow!
      name: 'TORG',
      title: 'TORG',
      icon: 'torg',
      layer: 'torgeternity',
      tools: menu,
    };
    /*
    btns.push({
      name: 'TORG',
      title: 'TORG',
      icon: 'torg',
      layer: 'torgeternity',
      tools: menu,
    });*/
  });
}
