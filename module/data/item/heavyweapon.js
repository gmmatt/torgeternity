import { GeneralItemData } from './general.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class HeavyWeaponItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for a heavy weapon
   */
  static defineSchema() {
    return {
      ...super.defineSchema('heavyweapon'),
      ammo: new fields.SchemaField({
        max: new fields.NumberField({ initial: 1, integer: true }),
        value: new fields.NumberField({ initial: 1, integer: true }),
      }),
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: 'heavyWeapons' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      equipped: new fields.BooleanField({ initial: false }),
      gunner: new fields.SchemaField({
        name: new fields.StringField({ initial: '' }),
        skillValue: new fields.StringField({ initial: '' }),
      }),
      notes: new fields.StringField({ initial: '' }),
      range: new fields.StringField({ initial: '' }),
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
