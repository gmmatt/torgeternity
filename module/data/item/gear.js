import { GeneralItemData } from './general.js';

/**
 * @inheritdoc
 */
export class GearItemData extends GeneralItemData {
  /**
 * @inheritdoc
 */
  static defineSchema() {
    return super.defineSchema('gear');
  }
}
