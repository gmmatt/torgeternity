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
      price: new fields.StringField({ initial: '', nullable: false }),
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
    // Calculate this.value based on this.price
    let found = this.price?.match(/^(\d+)(\D*)$/);
    if (!found) {
      this.value = null;
    } else {
      let price = Number(found[1]);
      if (found[2]) {
        const units = found[2];
        if (units === CONFIG.torgeternity.magnitudeLabels.billions) {
          price *= 1000000000;
        } else if (units === CONFIG.torgeternity.magnitudeLabels.millions) {
          price *= 1000000;
        } else if (units === CONFIG.torgeternity.magnitudeLabels.thousands) {
          price *= 1000;
        } else {
          // Unknown suffix, so don't generate a value
          price = null;
        }
      }
      this.value = price ? getTorgValue(price) : null;
    }
  }
}