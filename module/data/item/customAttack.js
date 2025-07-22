import { newTraitsField } from './general.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomAttackItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: 'unarmedCombat' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      damageType: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      notes: new fields.StringField({ initial: '' }),
      transferenceID: new fields.DocumentIdField({ initial: null }), // necessary for saving perks data in race items
      traits: newTraitsField('customAttack'),
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
