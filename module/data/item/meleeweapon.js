import { GeneralItemData } from "./general";

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class MeleeWeaponItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for a melee weapon
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: "meleeWeapons" }),
      bonus: new fields.NumberField({ initial: 2, integer: true }),
      chatNote: new fields.StringField({ initial: "" }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      damageType: new fields.StringField({ initial: "" }),
      equipped: new fields.BooleanField({ initial: false }),
      notes: new fields.StringField({ initial: "" }),
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
