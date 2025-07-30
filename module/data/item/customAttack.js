import { BaseItemData } from './baseItemData.js'

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomAttackItemData extends BaseItemData {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ...super.defineSchema('customAttack'),
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: 'unarmedCombat' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      damageType: new fields.StringField({ initial: '' }),
      notes: new fields.StringField({ initial: '' }),
      transferenceID: new fields.DocumentIdField({ initial: null }), // necessary for saving perks data in race items
    };
  }
}
