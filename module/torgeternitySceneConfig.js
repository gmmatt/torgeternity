import { torgeternity } from './config.js';

/**
 *
 */
export default class torgeternitySceneConfig extends foundry.applications.sheets.SceneConfig {

  static PARTS = {
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    basics: { template: "templates/scene/config/basics.hbs" },
    cosm: { template: `systems/torgeternity/templates/scenes/scenes-config.hbs` },
    grid: { template: "templates/scene/config/grid.hbs" },
    lighting: { template: "templates/scene/config/lighting.hbs", scrollable: [""] },
    ambience: { template: "templates/scene/config/ambience.hbs", scrollable: ["div.tab[data-tab=environment]"] },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  static TABS = {
    sheet: {
      tabs: [
        { id: "basics", icon: "fa-solid fa-image" },
        { id: "cosm", icon: "fa-solid fa-globe", label: "torgeternity.sheetLabels.cosm" },
        { id: "grid", icon: "fa-solid fa-grid" },
        { id: "lighting", icon: "fa-solid fa-lightbulb" },
        { id: "ambience", icon: "fa-solid fa-cloud-sun" }
      ],
      initial: "basics",
      labelPrefix: "SCENE.TABS.SHEET"
    },
    ambience: {
      tabs: [
        { id: "basic", icon: "fa-solid fa-table-list" },
        { id: "environment", icon: "fa-solid fa-cloud-sun" }
      ],
      initial: "basic",
      labelPrefix: "SCENE.TABS.AMBIENCE"
    }
  }

  async _preparePartContext(partId, context, options) {
    const result = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "cosm":
        context.zones = torgeternity.zones;
        context.cosmTypes = torgeternity.cosmTypes;
        break;
    }
    return result;
  }

  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);

    switch (event.target.dataset.field) {
      case "cosm":
        this.document.setFlag('torgeternity', 'cosm', event.target.value);
        break;
      case "cosm2":
        this.document.setFlag('torgeternity', 'cosm2', event.target.value);
        break;
      case "zone":
        {
          const zone = event.target.value;
          // More efficient than three calls to this.document.setFlag
          this.document.update({
            "flags.torgeternity.zone": zone,
            "flags.torgeternity.displayCosm2": (zone === 'mixed' || zone === 'dominant'), // i.e. not 'pure'
            "flags.torgeternity.isMixed": (zone === 'mixed')
          })
        }
        break;
    }
  }
}
