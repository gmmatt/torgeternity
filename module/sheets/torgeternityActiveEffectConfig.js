export default class TorgActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

  static PARTS = {
    header: { template: "templates/sheets/active-effect/header.hbs" },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    details: { template: "systems/torgeternity/templates/active-effect-details.hbs", scrollable: [""] },
    duration: { template: "templates/sheets/active-effect/duration.hbs" },
    changes: { template: "templates/sheets/active-effect/changes.hbs", scrollable: ["ol[data-changes]"] },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.systemFields = context.document.system.schema.fields;
    return context;
  }
}