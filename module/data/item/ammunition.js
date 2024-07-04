import { GeneralItemData } from './general.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class AmmunitionItemData extends GeneralItemData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      type: new fields.StringField({ initial: '' }),
      quantity: new fields.NumberField({ initial: 0 }),
      damageMod: new fields.NumberField({ integer: true, initial: 0 }),
      apMod: new fields.NumberField({ integer: true, initial: 0 }),
      fireDamage: new fields.BooleanField({ initial: false }),
      blastRadius: new fields.StringField({ initial: 'Medium' }),
      darknessMod: new fields.StringField({ initial: 'None' }),
      reach: new fields.StringField({ initial: '' }),
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
