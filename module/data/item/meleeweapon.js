import { BaseWeaponItemData } from './baseweapon.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class MeleeWeaponItemData extends BaseWeaponItemData {
  /**
   * @returns {object} Schema fragment for a melee weapon
   */
  static defineSchema(subtype = 'meleeweapon', attackwith = 'meleeWeapons') {
    return super.defineSchema(subtype, attackwith);
  }
}
