import { GeneralItemData } from "./general";

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class ShieldItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for a shield
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      bonus: new fields.NumberField({ initial: 1, integer: true }),
      equipped: new fields.BooleanField({ initial: false }),
      minStrength: new fields.StringField({ initial: "" }),
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
