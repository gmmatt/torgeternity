import { newTraitsField } from './general.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class EnhancementItemData extends foundry.abstract.TypeDataModel {
  /**
   * @returns {object} Schema fragment for an enhancement
   */
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: '' }),
      perk: new fields.StringField({ initial: '' }),
      traits: newTraitsField('enhancement'),
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
