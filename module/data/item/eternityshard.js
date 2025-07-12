import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class EternityShardItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      cosm: new fields.StringField({ initial: 'none', choices: torgeternity.cosmTypes, textSearch: true, required: true, blank: false, nullable: false }),
      description: new fields.HTMLField({ initial: '' }),
      possibilities: new fields.NumberField({ initial: 3, integer: true }),
      powers: new fields.StringField({ initial: '' }),
      purpose: new fields.StringField({ initial: '' }),
      restrictions: new fields.StringField({ initial: '' }),
      tappingDifficulty: new fields.NumberField({ initial: 18, integer: true }),
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
