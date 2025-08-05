import { BaseItemData } from './baseItemData.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class EternityShardItemData extends BaseItemData {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ...super.defineSchema('eternityshard'),
      possibilities: new fields.NumberField({ initial: 3, integer: true }),
      powers: new fields.StringField({ initial: '' }),
      purpose: new fields.StringField({ initial: '' }),
      restrictions: new fields.StringField({ initial: '' }),
      tappingDifficulty: new fields.NumberField({ initial: 18, integer: true }),
    };
  }
}
