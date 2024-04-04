/**
 *
 */
export class PossibilityByCosm extends Application {
  /**
   *
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/torgeternity/templates/possibilityByCosm.hbs',
      width: 'auto',
      height: 'auto',
      title: game.i18n.localize('torgeternity.sheetLabels.possibilityByCosm'),
      resizeable: false,
    });
  }

  /**
   *
   * @param actor
   */
  constructor(actor) {
    super();
    this.actorPoss = actor.getFlag('torgeternity', 'possibilityByCosm');
    this.actor = actor;
  }

  /**
   *
   * @param actor
   */
  static async create(actor) {
    new PossibilityByCosm(actor).render(true);
  }

  /**
   *
   */
  async getData() {
    // return mergeObject(await super.getData(), this.parameters)
    const data = super.getData();
    data.actor = this.actor;
    data.actorPoss = this.actor.getFlag('torgeternity', 'possibilityByCosm');
    return data;
  }

  /**
   *
   * @param html
   */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('.save-button').click(this.onSave.bind(this));
    html.find('.inputField').change(this.modifyPoss.bind(this));
    html.find('.content-link').click(this.testActiveModule.bind(this));
  }

  /**
   *
   * @param event
   */
  async testActiveModule(event) {
    const compendiumLink = event.target.dataset.uuid;
    try {
      const tes = await fromUuidSync(compendiumLink);
      if (!tes)
        ui.notifications.warn(game.i18n.localize('torgeternity.notifications.moduleNotActive'));
    } catch {
      (err) => {
        return;
      };
    }
  }

  /**
   *
   * @param event
   */
  async modifyPoss(event) {
    const ayslePoss = parseInt(document.getElementById('ayslePoss').value);
    const cyberpapacyPoss = parseInt(document.getElementById('cyberpapacyPoss').value);
    const coreEarthPoss = parseInt(document.getElementById('coreEarthPoss').value);
    const livingLandPoss = parseInt(document.getElementById('livingLandPoss').value);
    const nileEmpirePoss = parseInt(document.getElementById('nileEmpirePoss').value);
    const orrorshPoss = parseInt(document.getElementById('orrorshPoss').value);
    const panPacificaPoss = parseInt(document.getElementById('panPacificaPoss').value);
    const tharkoldPoss = parseInt(document.getElementById('tharkoldPoss').value);
    const otherPoss = parseInt(document.getElementById('otherPoss').value);
    const acto = this.actor;
    const possibilityByCosm = {
      ayslePoss: ayslePoss,
      cyberpapacyPoss: cyberpapacyPoss,
      coreEarthPoss: coreEarthPoss,
      livingLandPoss: livingLandPoss,
      nileEmpirePoss: nileEmpirePoss,
      orrorshPoss: orrorshPoss,
      panPacificaPoss: panPacificaPoss,
      tharkoldPoss: tharkoldPoss,
      otherPoss: otherPoss,
    };
    await acto.setFlag('torgeternity', 'possibilityByCosm', possibilityByCosm);
    await acto.update({ system: { other: { possibilities: coreEarthPoss } } });
    await this._render();
  }

  /**
   *
   * @param event
   */
  async onSave(event) {
    const ayslePoss = parseInt(document.getElementById('ayslePoss').value);
    const cyberpapacyPoss = parseInt(document.getElementById('cyberpapacyPoss').value);
    const coreEarthPoss = parseInt(document.getElementById('coreEarthPoss').value);
    const livingLandPoss = parseInt(document.getElementById('livingLandPoss').value);
    const nileEmpirePoss = parseInt(document.getElementById('nileEmpirePoss').value);
    const orrorshPoss = parseInt(document.getElementById('orrorshPoss').value);
    const panPacificaPoss = parseInt(document.getElementById('panPacificaPoss').value);
    const tharkoldPoss = parseInt(document.getElementById('tharkoldPoss').value);
    const otherPoss = parseInt(document.getElementById('otherPoss').value);
    const acto = this.actor;
    const possibilityByCosm = {
      ayslePoss: ayslePoss,
      cyberpapacyPoss: cyberpapacyPoss,
      coreEarthPoss: coreEarthPoss,
      livingLandPoss: livingLandPoss,
      nileEmpirePoss: nileEmpirePoss,
      orrorshPoss: orrorshPoss,
      panPacificaPoss: panPacificaPoss,
      tharkoldPoss: tharkoldPoss,
      otherPoss: otherPoss,
    };
    await acto.setFlag('torgeternity', 'possibilityByCosm', possibilityByCosm);
    await acto.update({ system: { other: { possibilities: coreEarthPoss } } });
    this.close();
  }
}
