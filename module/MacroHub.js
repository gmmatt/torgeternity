/**
 * A class that represents the MacroHub
 */
export default class MacroHub extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = 'systems/torgeternity/templates/macrohub/hub.html';
    options.id = 'MacroHub';
    options.title = game.i18n.localize('torgeternity.macros.macroHub.title');
    options.resizable = false;
    options.position = 'center';
    return options;
  }

  /**
   * activation of listeners
   */
  activateListeners(html) {
    super.activateListeners();

    html[0].querySelector('a.macroHubSpan').addEventListener('click', this.executeMacro());
  }

  /**
   * getData extension
   * @returns data
   */
  async getData() {
    const data = super.getData();

    data.macros = await game.packs.get('torgeternity.macros').index;

    return data;
  }

  toggleRender() {
    if (this.rendered) {
      if (this._minimized) return this.maximize();
      else return this.close();
    } else return this.render(true);
  }

  executeMacro(event) {
    console.log(event);
  }
}
