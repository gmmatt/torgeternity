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
      cosm: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      price: new fields.StringField({ initial: '' }),
      techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      equippedClass: new fields.StringField({ initial: 'item-equipped' }),
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
