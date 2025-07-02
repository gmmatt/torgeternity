import * as torgchecks from './torgchecks.js';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 *
 */
export class TestUpdate extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['torgeternity', 'application', 'test-dialog'],
    window: {
      title: 'Skill Test',
      resizable: false,
      contentClasses: ["standard-form"],
    },
    form: {
      handler: TestUpdate.#onRoll,
      submitOnChange: false,
      closeOnSubmit: true,
    }
  }

  static PARTS = {
    body: { template: 'systems/torgeternity/templates/test-update.hbs' },
    footer: { template: "templates/generic/form-footer.hbs" },
  }

  /**
   *
   * @param test
   */
  constructor(test) {
    super();
    this.test = test;
  }

  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.test = this.test;
    context.config = CONFIG.torgeternity;

    context.buttons = [
      { type: 'submit', icon: 'fas fa-redo', label: 'torgeternity.sheetLabels.update' }
    ]
    return context;
  }

  /**
   *
   * @param event
   * @param html
   */
  static async #onRoll(event, form, formData) {
    const fields = formData.object;

    foundry.utils.mergeObject(this.test, fields, { inplace: true });

    this.test.isOther1 = fields.other1Modifier != 0;
    this.test.isOther2 = fields.other2Modifier != 0;
    this.test.isOther3 = fields.other3Modifier != 0;

    this.test.diceroll = null;

    await torgchecks.renderSkillChat(this.test);
    this.close();
  }
}
