import { BaseItemData } from './baseItemData.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class VehicleAddOnItemData extends BaseItemData {
  /**
   * @returns {object} Schema fragment for a vehicle add-on
   */
  static defineSchema() {
    return {
      ...super.defineSchema('vehicleAddOn'),
      'short-description': new fields.StringField({ initial: '' }),
    };
  }
}
