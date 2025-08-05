import { BaseItemData } from './baseItemData.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class EnhancementItemData extends BaseItemData {
  /**
   * @returns {object} Schema fragment for an enhancement
   */
  static defineSchema() {
    return {
      ...super.defineSchema('enhancement'),
      perk: new fields.StringField({ initial: '' }),
    };
  }
}
