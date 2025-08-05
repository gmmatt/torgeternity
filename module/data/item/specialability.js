import { BaseItemData } from './baseItemData.js';

/**
 * @inheritdoc
 */
export class SpecialAbilityItemData extends BaseItemData {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return super.defineSchema('specialability');
  }
}
