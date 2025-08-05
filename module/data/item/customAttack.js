import { BaseWeaponItemData } from './baseweapon.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomAttackItemData extends BaseWeaponItemData {
  /**
   * @inheritdoc
   */
  static defineSchema(subtype = 'customAttack', attackwith = 'unarmedCombat') {
    return {
      ...super.defineSchema(subtype, attackwith),
      transferenceID: new fields.DocumentIdField({ initial: null }), // necessary for saving perks data in race items
    };
  }
}
