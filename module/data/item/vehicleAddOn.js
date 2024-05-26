const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class VehicleAddOnItemData extends foundry.abstract.TypeDataModel {
  /**
   * @returns {object} Schema fragment for a vehicle add-on
   */
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: '' }),
      'short-description': new fields.StringField({ initial: '' }),
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
