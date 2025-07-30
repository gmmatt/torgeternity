import { newTraitsField } from './general.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class SpecialAbilityRollableItemData extends foundry.abstract.TypeDataModel {
  /**
   * @returns {object} Schema fragment for a special ability
   */
  static defineSchema() {
    return {
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: 'unarmedCombat' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      description: new fields.HTMLField({ initial: '' }),
      traits: newTraitsField('specialability-rollable'),
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
