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

    html[0]
      .querySelectorAll('a.macroHubSpan')
      .forEach((spanM) => spanM.addEventListener('click', this._executeMacro.bind(this)));
  }

  /**
   * getData extension
   * @returns data
   */
  async getData() {
    const data = super.getData();

    const macros = await game.packs.get('torgeternity.macros').index;
    const sortable = [];

    for (const macro of macros) {
      sortable.push(macro);
    }

    sortable.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name === b.name) {
        return 0;
      } else {
        return 1;
      }
    });

    data.macros = {};
    Object.assign(data.macros, sortable);

    return data;
  }

  toggleRender() {
    if (this.rendered) {
      if (this._minimized) return this.maximize();
      else return this.close();
    } else return this.render(true);
  }

  async _executeMacro(event) {
    const macroPack = await game.packs.get('torgeternity.macros');
    const macroId = event.currentTarget.closest('.macroHubSpan').dataset.macroId;
    await macroPack.getDocument(macroId).then((m) => m.execute());
  }
}
