import { torgeternity } from '../../config.js';
import { PerkItemData } from './perk.js';

/**
 * @inheritdoc
 */
export class RaceItemData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
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
      hardCoded: new fields.JavaScriptField({ initial: '', trim: true }, { async: true }),
      perksData: new fields.ArrayField(new fields.DocumentUUIDField({ initial: null })),
      perksDataMore: new fields.TypeDataField({ document: PerkItemData }),
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
