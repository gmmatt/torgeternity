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
    let price = parseInt(this.price);
    const last = this.price.slice(-1);
    if (isNaN(price))
      this.value = null;
    else if (!isNaN(last))
      this.value = getTorgValue(price);
    else {
      switch (CONFIG.torgeternity.magnitudeLabels[last]) {
        case 'thousands': price *= 1000; break;
        case 'millions': price *= 1000000; break;
        case 'billions': price *= 1000000000; break;
        default: this.value = null; break;
      }
      if (price) this.value = getTorgValue(price);
    }
  }
}