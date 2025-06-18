/**
 *
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export default class GMScreen extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: 'gmscreen',
    classes: ['torgeternity'],
    position: {
      top: 10,
      width: 1300,
      height: 500,
    },
    window: {
      resizable: true,
    },
    actions: {
      clickPanel: GMScreen.#clickPanel,
    }
  };

  static PARTS = {
    gmscreen: { template: 'systems/torgeternity/templates/gmscreen/screen.html' },
  };

  get title() {
    return game.i18n.localize('torgeternity.gmScreen.title');
  }

  /**
   *
   * @param evt
   */
  static #clickPanel(evt) {
    let cl;

    const GMScreen = this.element.querySelectorAll('#gm-screen')[0];
    switch (evt.target.id) {
      case 'right-panel':
        cl = 'focus-right';

        break;
      case 'center-panel':
        cl = 'focus-center';

        break;
      case 'left-panel':
        cl = 'focus-left';

        break;
    }
    GMScreen.classList.toggle(cl);
  }
  /**
   *
   */
  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    const path = game.settings.get('torgeternity', 'gmScreen');
    let lang = game.settings.get('core', 'language');

    // setting english as default
    if (lang != 'en' && lang != 'de' && lang != 'fr') {
      lang = 'en';
    }
    if (path == 'none') {
      data.noScreen = true;
      data.background = false;
    } else {
      data.background = `style="background-image:url(./modules/${path}/images/gmscreen/${lang}.webp)"`;
    }
    return data;
  }
  /**
   *
   */
  toggleRender() {
    if (!this.rendered)
      return this.render(true);
    else if (this._minimized)
      return this.maximize();
    else
      return this.close();
  }
}
