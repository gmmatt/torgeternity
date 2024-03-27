/**
 *
 */
export default class GMScreen extends Application {
  /**
   *
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = 'systems/torgeternity/templates/gmscreen/screen.html';
    options.width = '1300';
    options.height = '500';
    options.id = 'GMScreen';
    options.title = game.i18n.localize('torgeternity.gmScreen.title');
    options.resizable = true;
    options.top = 10;
    return options;
  }

  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.screen-panel').click(this.clickPanel.bind(this));
  }
  /**
   *
   * @param evt
   */
  clickPanel(evt) {
    let cl;

    const GMScreen = this.element.find('#gm-screen')[0];
    switch (evt.currentTarget.id) {
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
  getData() {
    const data = super.getData();
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
    if (this.rendered) {
      if (this._minimized) return this.maximize();
      else return this.close();
    } else return this.render(true);
  }
}
