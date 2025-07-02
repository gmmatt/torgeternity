/**
 *
 */
export default class torgeternityCardConfig extends foundry.applications.sheets.CardConfig {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity'],
  }

  static PARTS = {
    header: { template: 'templates/cards/card/header.hbs' },
    tabs: { template: "templates/generic/tab-navigation.hbs" },
    details: { template: 'systems/torgeternity/templates/cards/torgeternityCard.hbs' },
    faces: { template: "templates/cards/card/faces.hbs", scrollable: [""] },
    back: { template: "templates/cards/card/back.hbs" },
    footer: { template: "templates/generic/form-footer.hbs" }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.systemFields = context.document.system.schema.fields;
    return context;
  }
}
