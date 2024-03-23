import { GeneralItemData } from "./general";

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class ArmorItemData extends GeneralItemData {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      bonus: new fields.NumberField({ initial: 1, integer: true }),
      equipped: new fields.BooleanField({ initial: false }),
      maxDex: new fields.NumberField({ initial: 12, integer: true }),
      minStrength: new fields.NumberField({ initial: 0, integer: true }),
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
