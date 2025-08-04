import { MissileWeaponItemData } from './missileweapon.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class FirearmItemData extends MissileWeaponItemData {
  /**
   * @returns {object} Schema fragment for a firearm
   */
  static defineSchema(subtype = 'firearm', attackwith = 'fireCombat') {
    return MissileWeaponItemData.defineSchema(subtype, attackwith);
  }
}
