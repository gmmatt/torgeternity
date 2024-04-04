const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class SpecialAbilityRollableItemData extends foundry.abstract.TypeDataModel {
  /**
   * @returns {object} Schema fragment for a special ability
   */
  static defineSchema() {
    return {
      ap: new fields.NumberField({ initial: 0, integer: true }),
      attackWith: new fields.StringField({ initial: '' }),
      chatNote: new fields.StringField({ initial: '' }),
      damage: new fields.StringField({ initial: '' }),
      description: new fields.HtmlField({ initial: '' }),
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
