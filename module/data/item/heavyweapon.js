import { MissileWeaponItemData } from './missileweapon.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class HeavyWeaponItemData extends MissileWeaponItemData {
  /**
   * @returns {object} Schema fragment for a heavy weapon
   */
  static defineSchema(subtype = 'heavyweapon', attackwith = 'heavyWeapons') {
    return super.defineSchema(subtype, attackwith);
  }
}
