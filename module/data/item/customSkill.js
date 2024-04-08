const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class CustomSkillItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      adds: new fields.StringField({ initial: '1' }),
      baseAttribute: new fields.StringField({ initial: 'strength' }),
      description: new fields.HTMLField({ initial: '' }),
      isFav: new fields.StringField({ initial: '' }),
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
