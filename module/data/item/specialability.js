import { newTraitsField } from './general.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class SpecialAbilityItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: '' }),
      traits: newTraitsField('specialability'),
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
