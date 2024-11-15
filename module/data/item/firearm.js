import { GeneralItemData } from './general.js';
import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class FirearmItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for a firearm
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ammo: new fields.SchemaField({
        max: new fields.NumberField({ initial: 1, integer: true }),
        value: new fields.NumberField({ initial: 1, integer: true }),
      }),
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: 'fireCombat' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      damageType: new fields.StringField({ initial: '' }),
      equipped: new fields.BooleanField({ initial: false }),
      notes: new fields.StringField({ initial: '' }),
      range: new fields.StringField({ initial: '' }),
      magnitude: new fields.StringField({
        initial: 'ones',
        choices: Object.keys(torgeternity.magnitudes),
        required: true,
      }),
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
