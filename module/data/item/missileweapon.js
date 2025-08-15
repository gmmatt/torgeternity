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
      loadedAmmo: new fields.DocumentIdField({ initial: null }),
      gunner: new fields.ForeignDocumentField(TorgeternityActor),
    };
  }

  /**
   * If the item has a gunner, then return the gunner's name and skillValue
   */
  get gunnerSkill() {
    if (this.gunner)
      return this.gunner.system.skills[this.attackWith];
    else
      return { value: 0 }
  }
}
