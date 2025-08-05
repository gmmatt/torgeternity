import { BaseItemData } from './baseItemData.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomSkillItemData extends BaseItemData {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ...super.defineSchema('customSkill'),
      adds: new fields.NumberField({ initial: 1 }),
      baseAttribute: new fields.StringField({ initial: 'strength' }),
      value: new fields.NumberField({ initial: 1 }),
      isFav: new fields.BooleanField({ initial: false }),
    };
  }
}
