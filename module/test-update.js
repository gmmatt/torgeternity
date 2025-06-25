import * as torgchecks from './torgchecks.js';
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

/**
 *
 */
export class TestUpdate extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ['torgeternity', 'application', 'standard-form', 'test-dialog'],
    window: {
      title: 'Skill Test',
      resizable: false
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

    // Set DN Descriptor
    this.test.DNDescriptor = fields.DNDescriptor;

    // Add movement modifier ('running-radio')
    this.test.movementModifier = fields.movement;

    // Add multi-action modifier('multi1-radio')('multi2-radio')('multi3-radio')
    this.test.multiModifier = fields.multiAction;

    // Add multi-target modifier('targets1-radio')
    this.test.targetsModifier = fields.multiTarget;

    // Add other modifier 1
    for (let i = 1; i <= 3; i++) {
      const modifier = fields[`otherEffect${i}`];
      const isActive = modifier != 0;

      this.test[`isOther${i}`] = isActive;

      if (isActive) {
        this.test[`other${i}Description`] = fields[`otherDescription${i}`];
        this.test[`other${i}Modifier`] = modifier;
      }
    }

    this.test.diceroll = null;

    await torgchecks.renderSkillChat(this.test);
    this.close();
  }
}
