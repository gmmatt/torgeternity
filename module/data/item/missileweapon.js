import { BaseWeaponItemData } from './baseweapon.js';
import TorgeternityActor from '../../documents/actor/torgeternityActor.js'

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class MissileWeaponItemData extends BaseWeaponItemData {
  /**
   * @returns {object} Schema fragment for a missile weapon
   */
  static defineSchema(subtype = 'missileweapon', attackwith = 'missileWeapons') {
    return {
      ...super.defineSchema(subtype, attackwith),
      range: new fields.StringField({ initial: '' }),
      ammo: new fields.SchemaField({
        max: new fields.NumberField({ initial: 1, integer: true }),
        value: new fields.NumberField({ initial: 1, integer: true }),
      }),
      gunnerId: new fields.ForeignDocumentField(TorgeternityActor),
    };
  }
}
