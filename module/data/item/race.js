import { torgeternity } from '../../config.js';

/**
 * @inheritdoc
 */
export class RaceItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      name: new fields.StringField({ initial: '' }),
      description: new fields.StringField({ initial: '' }),
      attributeMaximum: new fields.SchemaField({
        charisma: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        dexterity: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        mind: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        spirit: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        strength: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
      }),
      cosm: new fields.StringField({
        initial: 'none',
        choices: Object.keys(torgeternity.cosmTypes),
        required: true,
      }),
      hardCoded: new fields.StringField({ initial: '' }),
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
