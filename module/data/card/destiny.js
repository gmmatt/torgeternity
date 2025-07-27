const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class DestinyCardData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for a Storm Knight or Threat
   */
  static defineSchema() {
    return {
      number: new fields.NumberField({ initial: 1, integer: true }),
      pooled: new fields.BooleanField({ initial: false, label: 'torgeternity.dramaCard.pooled' }),
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
