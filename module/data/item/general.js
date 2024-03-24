const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class GeneralItemData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for a Storm Knight or Threat
   */
  static defineSchema() {
    return {
      cosm: new fields.StringField({ initial: "" }),
      description: new fields.HtmlField({ initial: "" }),
      price: new fields.NumberField({ initial: 0, integer: true }),
      techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
    };
  }

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }
}
