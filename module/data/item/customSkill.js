import { newTraitsField } from './general.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomSkillItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      adds: new fields.NumberField({ initial: 1 }),
      baseAttribute: new fields.StringField({ initial: 'strength' }),
      value: new fields.NumberField({ initial: 1 }),
      description: new fields.HTMLField({ initial: '' }),
      isFav: new fields.BooleanField({ initial: false }),
      traits: newTraitsField('customSkill'),
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
