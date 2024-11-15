import { GeneralItemData } from './general.js';
import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class VehicleItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for a vehicle
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      mr: new fields.NumberField({ initial: -1, integer: true }),
      pass: new fields.NumberField({ initial: 1, integer: true }),
      topspeed: new fields.StringField({ initial: '' }),
      tough: new fields.StringField({ initial: '' }),
      wounds: new fields.NumberField({ initial: 3, integer: true }),
      magnitude: new fields.StringField({
        initial: 'ones',
        choices: Object.keys(torgeternity.magnitudes),
        required: true,
      }),
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
