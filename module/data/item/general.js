import { getTorgValue } from '../../torgchecks.js';
import { BaseItemData } from './baseItemData.js'

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class GeneralItemData extends BaseItemData {
  /**
   *
   * @returns {object} Schema fragment for an item
   */
  static defineSchema(itemType) {
    return {
      ...super.defineSchema(itemType),
      price: new fields.StringField({ initial: '' }),
      techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      secondaryAxiom: new fields.SchemaField({
        selected: new fields.StringField({ initial: 'none' }),
        value: new fields.NumberField({ initial: null, integer: true }),
      }),
    };
  }

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    super.prepareBaseData();
    this.value = this.price && !isNaN(this.price) ? getTorgValue(parseInt(this.price)) : null;
  }
}