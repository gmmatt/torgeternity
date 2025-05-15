import { torgeternity } from './config.js';

/**
 *
 */
export default class torgeternitySceneConfig extends foundry.applications.sheets.SceneConfig {
  getData(options = {}) {
    const context = super.getData(options);

    context.zones = torgeternity.zones;

    context.cosmTypes = torgeternity.cosmTypes;

    return context;
  }

  /**
   *
   */
  get template() {
    // modified path => one folder per type
    return `systems/torgeternity/templates/scenes/scenes-config.hbs`;
  }
  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);

    const selCosm = html.find('select.cosm')[0];
    selCosm.addEventListener('change', this._onChangeCosm.bind(this));
    const selZone = html.find('select.zone-type')[0];
    selZone.addEventListener('change', this._onChangeZone.bind(this));

    const selCosm2 = html.find('select.cosm-secondary')[0];
    if (selCosm2) {
      selCosm2.addEventListener('change', this._onChangeCosm2.bind(this));
    }
  }

  /**
   *
   * @param ev
   */
  _onChangeCosm(ev) {
    const cosm = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
    this.document.setFlag('torgeternity', 'cosm', cosm);
  }
  /**
   *
   * @param ev
   */
  _onChangeZone(ev) {
    const zone = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
    this.document.setFlag('torgeternity', 'zone', zone);
    if (zone === 'mixed' || zone === 'dominant') {
      this.document.setFlag('torgeternity', 'displayCosm2', true);
    } else {
      this.document.setFlag('torgeternity', 'displayCosm2', false);
    }
    if (zone === 'mixed') {
      this.document.setFlag('torgeternity', 'isMixed', true);
    } else {
      this.document.setFlag('torgeternity', 'isMixed', false);
    }
  }
  /**
   *
   * @param ev
   */
  _onChangeCosm2(ev) {
    const cosm = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
    this.document.setFlag('torgeternity', 'cosm2', cosm);
  }
}
