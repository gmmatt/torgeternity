import { GeneralItemData } from "./general";

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class ImplantItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for an implant
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
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
